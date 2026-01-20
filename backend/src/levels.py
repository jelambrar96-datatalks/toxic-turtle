LEFT = 'left'
RIGHT = 'right'
DOWN = 'down'
UP = 'up'
SPACE = 'space'



CODE_LEVELS = [
    (
        "forward 10"
    ),
    (
        "forward 20"
    ),
    (
        "forward 10"
        "forward 20"
        "forward 10"
    ),
    (
        "forward 20"
        "turnleft 90"
        "forward 20"
    )
]



MOVEMENT_LEVELS = [
    (SPACE),
    (SPACE, SPACE),
    (SPACE, SPACE, SPACE, SPACE),
    (SPACE, SPACE, LEFT, SPACE, SPACE),
]


CURSOR_LEVELS = [
    (0),
    (0, 0),
    (0, 1, 1, 2),
    (0, 0, 1, 2, 2),
]

