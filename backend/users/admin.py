from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserFile


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')

    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительные поля', {
            'fields': ('encrypted_data', 'encrypted_media', 'file_metadata')
        }),
    )

    readonly_fields = ('date_joined', 'last_login')


@admin.register(UserFile)
class UserFileAdmin(admin.ModelAdmin):
    list_display = ('original_name', 'user', 'file_size', 'content_type', 'uploaded_at')
    list_filter = ('content_type', 'uploaded_at')
    search_fields = ('original_name', 'user__username', 'description')
    readonly_fields = ('uploaded_at',)

    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'original_name', 'file_size', 'content_type')
        }),
        ('Дополнительно', {
            'fields': ('description', 'uploaded_at', 'encrypted_data')
        }),
    )