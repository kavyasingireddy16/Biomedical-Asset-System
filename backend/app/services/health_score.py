def calculate_health_score(status: str, maintenance_cost: float):

    score = 100

    # Asset status impact
    if status == "Working":
        score -= 0

    elif status == "Under Maintenance":
        score -= 20

    elif status == "Out of Service":
        score -= 50

    # Maintenance cost impact
    if maintenance_cost > 10000:
        score -= 30

    elif maintenance_cost > 5000:
        score -= 20

    elif maintenance_cost > 2000:
        score -= 10

    if score < 0:
        score = 0

    return score