from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

app_name = 'users'

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.user_profile_view, name='profile'),
    path('upload/', views.file_upload_view, name='file_upload'),
    path('files/', views.user_files_view, name='files'),
]