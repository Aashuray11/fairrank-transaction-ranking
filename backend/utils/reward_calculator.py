def calculate_points(amount: float) -> int:
    if amount < 100:
        return 1
    if amount <= 1000:
        return int(amount // 10)
    return int(amount // 20)
