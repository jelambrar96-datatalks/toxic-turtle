"""Game routes for level progression and certificates."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth import current_active_user
from src.database import get_async_session
from src.models import User, Progress, Certificate
from src.schemas.game_schemas import ProgressCreate, ProgressRead, CertificateCreate, CertificateRead
from src.levels import CODE_LEVELS, MOVEMENT_LEVELS, CURSOR_LEVELS

# Get total number of levels
TOTAL_LEVELS = len(CODE_LEVELS)

router = APIRouter(prefix="/game", tags=["game"])


async def _check_user_can_play_level(
    user_id: UUID,
    level: int,
    session: AsyncSession,
) -> bool:
    """
    Check if user can play a specific level.
    User can play level N only if they have passed all levels 1 to N-1.
    """
    if level < 1 or level > TOTAL_LEVELS:
        return False
    
    # First level can always be played
    if level == 1:
        return True
    
    # For other levels, check if all previous levels are passed
    """for previous_level in range(level - 1):
        passed = await session.scalar(
            select(Progress).where(
                and_(
                    Progress.user_id == user_id,
                    Progress.level == previous_level,
                )
            )
        )
        if not passed:
            return False"""
    
    passed = await session.scalar(
            select(Progress).where(
                and_(
                    Progress.user_id == user_id,
                    Progress.level == (level - 1),
                )
            )
        )
    if not passed:
        return False
    
    return True


@router.get("/current_level", response_model=dict)
async def get_current_level(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Get the maximum level passed by the current user.
    Returns the highest level number completed, or 0 if no levels passed.
    """
    stmt = select(func.max(Progress.level)).where(Progress.user_id == user.id)
    result = await session.scalar(stmt)
    
    max_level = result if result is not None else None
    
    return {
        "user_id": str(user.id),
        "current_level": max_level,
        "total_levels": TOTAL_LEVELS,
    }


@router.post("/pass_level", response_model=ProgressRead)
async def pass_level(
    progress_data: ProgressCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Record that the current user has passed a level.
    Creates a new progress record for the user and level.
    User can only pass a level if all previous levels have been passed.
    """
    # Validate level number
    if progress_data.level < 1 or progress_data.level > TOTAL_LEVELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid level. Must be between 1 and {TOTAL_LEVELS}",
        )
    
    # Check if user can play this level (all previous levels must be passed)
    can_play = await _check_user_can_play_level(user.id, progress_data.level, session)
    if not can_play:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cannot pass level {progress_data.level}. Must pass all previous levels first.",
        )
    
    # # Check if user already passed this level
    # existing = await session.scalar(
    #     select(Progress).where(
    #         and_(
    #             Progress.user_id == user.id,
    #             Progress.level == progress_data.level,
    #         )
    #     )
    # )
    
    # if existing:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail=f"Level {progress_data.level} already passed by this user",
    #     )
    
    # Create new progress record
    progress = Progress(
        user_id=user.id,
        level=progress_data.level,
    )
    
    session.add(progress)
    await session.commit()
    await session.refresh(progress)
    
    return progress


@router.get("/check_pass_all_level", response_model=dict)
async def check_pass_all_levels(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Check if the current user has passed all available levels.
    Returns True if all levels are passed, False otherwise.
    """
    # Count unique levels passed by the user
    stmt = select(func.count(func.distinct(Progress.level))).where(
        Progress.user_id == user.id
    )
    levels_passed = await session.scalar(stmt)
    
    all_levels_passed = levels_passed == TOTAL_LEVELS
    
    return {
        "user_id": str(user.id),
        "all_levels_passed": all_levels_passed,
        "levels_passed": levels_passed or 0,
        "total_levels": TOTAL_LEVELS,
    }


@router.post("/register_certificate", response_model=CertificateRead, status_code=status.HTTP_201_CREATED)
async def register_certificate(
    certificate_data: CertificateCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Register a new certificate for the current user.
    Certificate name must be unique per user (cannot register the same certificate twice).
    """
    # Check if certificate already exists for this user
    existing = await session.scalar(
        select(Certificate).where(
            and_(
                Certificate.user_id == user.id,
                Certificate.certificate_name == certificate_data.certificate_name,
            )
        )
    )
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Certificate '{certificate_data.certificate_name}' already registered for this user",
        )
    
    # Create new certificate
    certificate = Certificate(
        user_id=user.id,
        certificate_name=certificate_data.certificate_name,
    )
    
    session.add(certificate)
    await session.commit()
    await session.refresh(certificate)
    
    return certificate


@router.get("/get_certified_data", response_model=CertificateRead)
async def get_certified_data(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Get the latest certificate registered for the current user.
    Returns a single certificate object with details.
    """
    stmt = select(Certificate).where(
        Certificate.user_id == user.id
    ).order_by(Certificate.issued_at.desc()).limit(1)
    
    certificate = await session.scalar(stmt)
    
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No certificate found for this user",
        )
    
    return certificate


@router.get("/check_if_certified_exist", response_model=dict)
async def check_if_certified_exist(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Check if a specific certificate exists for the current user.
    """
    cert = await session.scalar(
        select(Certificate).where(
            and_(
                Certificate.user_id == user.id,
            )
        )
    )
    
    exists = cert is not None
    
    return {
        "user_id": str(user.id),
        "exists": exists,
        "issued_at": cert.issued_at if cert else None,
    }


@router.get("/user_progress_summary", response_model=dict)
async def get_user_progress_summary(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Get a comprehensive summary of user's game progress and certificates.
    """
    # Get all progress records
    progress_stmt = select(Progress).where(
        Progress.user_id == user.id
    ).order_by(Progress.level)
    progress_records = await session.scalars(progress_stmt)
    progress_list = progress_records.all()
    
    # Get all certificates
    cert_stmt = select(Certificate).where(
        Certificate.user_id == user.id
    ).order_by(Certificate.issued_at.desc())
    certificates = await session.scalars(cert_stmt)
    cert_list = certificates.all()
    
    # Calculate statistics
    max_level = max([p.level for p in progress_list], default=0)
    levels_passed = len(progress_list)
    all_levels_passed = levels_passed == TOTAL_LEVELS
    
    return {
        "user_id": str(user.id),
        "username": user.username,
        "max_level": max_level,
        "levels_passed": levels_passed,
        "total_levels": TOTAL_LEVELS,
        "all_levels_passed": all_levels_passed,
        "progress_percentage": round((levels_passed / TOTAL_LEVELS) * 100, 2),
        "certificates_count": len(cert_list),
        "certificates": [
            {
                "id": str(c.id),
                "certificate_name": c.certificate_name,
                "issued_at": c.issued_at.isoformat(),
            }
            for c in cert_list
        ],
    }

@router.get("/get_level_data", response_model=dict)
async def get_level_data(
    level: int = Query(..., ge=1, description="Level number"),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Get level data (code, movements, cursor) for a specific level.
    User can only access a level if all previous levels have been passed.
    
    Returns:
    - level_number: The requested level
    - code: Code instructions for the level
    - movements: Available movement options
    - cursor: Cursor positions for the level
    - can_play: Whether user can play this level
    """
    # Validate level number
    if level < 1 or level > TOTAL_LEVELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid level. Must be between 0 and {TOTAL_LEVELS - 1}",
        )
    
    # Check if user can play this level
    can_play = await _check_user_can_play_level(user.id, level, session)
    
    if not can_play:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cannot access level {level}. Must pass all previous levels first.",
        )
    
    index_level = level - 1

    # Return level data
    return {
        "user_id": str(user.id),
        "level_number": level,
        "code": CODE_LEVELS[index_level],
        "movements": MOVEMENT_LEVELS[index_level],
        "cursor": CURSOR_LEVELS[index_level],
        "can_play": True,
    }
