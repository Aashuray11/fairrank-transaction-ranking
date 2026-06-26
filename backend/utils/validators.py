VALID_TRANSACTION_TYPES = {"purchase", "recharge", "payment"}


def validate_transaction_payload(payload):
    if not isinstance(payload, dict):
        return False, "Invalid JSON body"

    transaction_id = payload.get("transactionId")
    user_id = payload.get("userId")
    amount = payload.get("amount")
    tx_type = payload.get("type")

    if not transaction_id or not isinstance(transaction_id, str):
        return False, "transactionId is required"

    if not user_id or not isinstance(user_id, str):
        return False, "userId is required"

    try:
        amount_value = float(amount)
    except (TypeError, ValueError):
        return False, "amount must be a number greater than zero"

    if amount_value <= 0:
        return False, "amount must be greater than zero"

    if tx_type not in VALID_TRANSACTION_TYPES:
        return False, "transaction type must be valid"

    return True, ""
