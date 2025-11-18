import logging

# Создаем логгер для бизнес-логики
business_logger = logging.getLogger('api')


def log_user_action(user, action, details=None):
    """
    Логирование действий пользователя
    """
    log_data = {
        'action': action,
        'user': str(user) if user else 'Anonymous',
        'user_id': user.id if user else None,
    }

    if details:
        log_data['details'] = details

    business_logger.info(f"USER_ACTION: {log_data}")


def log_api_call(request, view_name, extra_info=None):
    """
    Логирование вызовов API
    """
    # ИСПРАВЛЕНО: теперь request идет первым аргументом
    log_data = {
        'view': view_name,
        'method': request.method,
        'path': request.path,
        'user': str(request.user) if request.user.is_authenticated else 'Anonymous',
        'user_id': request.user.id if request.user.is_authenticated else None,
    }

    if extra_info:
        log_data.update(extra_info)

    business_logger.info(f"API_CALL: {log_data}")


def log_security_event(event_type, request, details=None):
    """
    Логирование security событий
    """
    log_data = {
        'security_event': event_type,
        'method': request.method,
        'path': request.path,
        'client_ip': get_client_ip(request),
        'user': str(request.user) if request.user.is_authenticated else 'Anonymous',
    }

    if details:
        log_data['details'] = details

    business_logger.warning(f"SECURITY: {log_data}")


def get_client_ip(request):
    """
    Получение IP адреса клиента
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip