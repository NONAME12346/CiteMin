from apscheduler.schedulers.background import BackgroundScheduler
from .scraper import parse_gismeteo


def start_scheduler():
    scheduler = BackgroundScheduler()

    # Добавляем задачу: запускать parse_gismeteo каждые 30 минут
    # (Для тестов можно поставить seconds=60, чтобы быстрее проверить)
    scheduler.add_job(parse_gismeteo, 'interval', minutes=1, id='weather_parser', replace_existing=True)

    scheduler.start()