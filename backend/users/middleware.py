import time
import logging
import json
from django.utils.deprecation import MiddlewareMixin

# Создаем логгер для API запросов
logger = logging.getLogger('api')


class RequestResponseLoggingMiddleware(MiddlewareMixin):
    """
    Middleware для логирования всех входящих запросов и исходящих ответов
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Засекаем время начала обработки запроса
        start_time = time.time()

        # Логируем входящий запрос
        self.log_request(request)

        # Получаем ответ
        response = self.get_response(request)

        # Засекаем время окончания обработки
        duration = time.time() - start_time

        # Логируем исходящий ответ
        self.log_response(request, response, duration)

        return response

    def get_client_ip(self, request):
        """
        Получение IP адреса клиента
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def log_request(self, request):
        """
        Логирование входящего запроса
        """
        try:
            # Собираем информацию о запросе
            request_info = {
                'method': request.method,
                'path': request.path,
                'query_params': dict(request.GET),
                'client_ip': self.get_client_ip(request),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'user': str(request.user) if request.user.is_authenticated else 'Anonymous',
            }

            # Для POST/PUT запросов логируем тело (кроме паролей)
            if request.method in ['POST', 'PUT', 'PATCH']:
                body = self.safe_get_request_body(request)
                if body:
                    request_info['request_body'] = body

            logger.info(f"REQUEST: {json.dumps(request_info, ensure_ascii=False)}")

        except Exception as e:
            logger.error(f"Error logging request: {str(e)}")

    def log_response(self, request, response, duration):
        """
        Логирование исходящего ответа
        """
        try:
            response_info = {
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration_seconds': round(duration, 3),
                'client_ip': self.get_client_ip(request),
                'user': str(request.user) if request.user.is_authenticated else 'Anonymous',
            }

            # Для ошибок логируем дополнительную информацию
            if response.status_code >= 400:
                response_info['response_body'] = self.safe_get_response_body(response)

            logger.info(f"RESPONSE: {json.dumps(response_info, ensure_ascii=False)}")

        except Exception as e:
            logger.error(f"Error logging response: {str(e)}")

    def safe_get_request_body(self, request):
        """
        Безопасное получение тела запроса (исключая чувствительные данные)
        """
        try:
            # Копируем POST данные
            body = request.POST.copy()

            # Удаляем чувствительные данные
            sensitive_fields = ['password', 'password1', 'password2', 'token', 'secret']
            for field in sensitive_fields:
                if field in body:
                    body[field] = '***HIDDEN***'

            # Если это JSON запрос
            if request.content_type == 'application/json' and request.body:
                try:
                    json_body = json.loads(request.body)
                    # Маскируем чувствительные поля в JSON
                    for field in sensitive_fields:
                        if field in json_body:
                            json_body[field] = '***HIDDEN***'
                    return json_body
                except json.JSONDecodeError:
                    return str(body)

            return dict(body)

        except Exception as e:
            logger.warning(f"Could not read request body: {str(e)}")
            return None

    def safe_get_response_body(self, response):
        """
        Безопасное получение тела ответа
        """
        try:
            if hasattr(response, 'data'):
                return response.data
            return getattr(response, 'content', '')[:1000]  # Ограничиваем длину
        except Exception as e:
            logger.warning(f"Could not read response body: {str(e)}")
            return None


class ErrorLoggingMiddleware(MiddlewareMixin):
    """
    Middleware для логирования ошибок
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        """
        Обработка исключений
        """
        logger.error(
            f"EXCEPTION: {str(exception)} | "
            f"URL: {request.path} | "
            f"Method: {request.method} | "
            f"User: {request.user} | "
            f"IP: {self.get_client_ip(request)}"
        )
        return None

    def get_client_ip(self, request):
        """
        Получение IP адреса клиента
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip