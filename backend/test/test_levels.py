from  src.levels import CODE_LEVELS, MOVEMENT_LEVELS, CURSOR_LEVELS


def test_same_len():
    set_len = set([len(CODE_LEVELS), len(MOVEMENT_LEVELS), len(CURSOR_LEVELS)])
    assert len(set_len) == 1


def test_same_len_mov_cursor():
    for i, cursor_list, movement_list in zip(range(len(CURSOR_LEVELS)), CURSOR_LEVELS, MOVEMENT_LEVELS):
        assert len(cursor_list) == len(movement_list), f"ERROR: in element {i}: \nCURSOR {cursor_list}\nMOVEMENT {movement_list}"

