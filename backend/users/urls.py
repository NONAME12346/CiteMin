from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('profile/', views.profile_view, name='profile'),
    path('upload/', views.upload_file_view, name='upload'),
    path('files/', views.user_files_view, name='files'),
]