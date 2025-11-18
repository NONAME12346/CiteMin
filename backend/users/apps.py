from django.apps import AppConfig
import os

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
    verbose_name = 'Пользователи'

    def ready(self):
        # Проверяем, что это основной процесс (чтобы не запускать дважды при авто-перезагрузке)
        if os.environ.get('RUN_MAIN') == 'true':
            from .utils.scheduler import start_scheduler
            try:
                start_scheduler()
                print("--- Scheduler started ---")
            except Exception as e:
                print(f"--- Scheduler failed to start: {e} ---")