import requests
from bs4 import BeautifulSoup
from ..models import WeatherData
import logging

logger = logging.getLogger('api')


def parse_gismeteo():
    url = 'https://www.gismeteo.ru/weather-taganrog-5106/now/'

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ru-RU,ru;q=0.9',
    }

    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        print(f"--- Страница загружена: {soup.title.string if soup.title else 'No Title'} ---")

        temperature = None
        description = None

        # 1. Температура (ищем атрибут value, если текста нет)
        temp_element = soup.select_one('div.now-weather temperature-value')

        if temp_element:
            # Сначала пробуем текст
            temp_text = temp_element.text.strip()
            if temp_text:
                temperature = temp_text
            else:
                # Если текста нет (JS не сработал), берем атрибут value="14"
                val = temp_element.get('value')
                if val:
                    # Добавляем плюс для положительных чисел для красоты
                    if not val.startswith('-') and not val.startswith('0'):
                        temperature = f"+{val}"
                    else:
                        temperature = val
                    # Добавляем значок градуса
                    temperature += "°C"

        if not temperature:
            temperature = "Н/Д"

        # 2. Описание
        desc_element = soup.select_one('div.now-desc')
        if desc_element:
            description = desc_element.text.strip()
        else:
            description = "Нет данных"

        # 3. Сохраняем результат
        WeatherData.objects.create(
            temperature=temperature,
            description=description,
            source_url=url
        )

        result_msg = f"Температура: {temperature}, Описание: {description}"
        logger.info(f"Weather parsed: {result_msg}")
        print(f"✅ Успешный парсинг: {result_msg}")

    except Exception as e:
        logger.error(f"Error parsing Gismeteo: {e}")
        print(f"❌ Ошибка парсинга: {e}")