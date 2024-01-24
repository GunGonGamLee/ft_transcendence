from pathlib import Path
from decouple import config
import environ
import os
import hvac
import requests
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, '..', '.env')
env = environ.Env()
DEBUG = True
env.read_env(env_file=ENV_PATH)


def wait_for_vault_client(client, retries=5, delay=5):
    for i in range(retries):
        try:
            if client.sys.is_initialized() and client.sys.is_sealed() == False:
                print("Vault is ready!")
                return
            else:
                print("Vault is not ready yet. retrying...")
        except hvac.exceptions.VaultError as e:
            print(f"Waiting for Vault to be ready: {e}")
        time.sleep(delay)
    raise Exception("Vault is not ready")


if DEBUG:
    # DB
    DB_HOST = config('DB_HOST')
    DB_PASSWORD = config('DB_PASSWORD')
    DB_USER = config('DB_USER')
    DB_DATABASE = config('DB_DATABASE')
    DB_PORT = config('DB_PORT')

    # Logstash
    LOG_KEY = config('LOG_KEY')
    SECRET_KEY = config('LOG_KEY')

    # Intra 42
    INTRA42_AUTHORIZE_API= config('INTRA42_AUTHORIZE_API')
    INTRA42_TOKEN_API = config('INTRA42_TOKEN_API')
    INTRA42_CLIENT_ID = config('INTRA42_CLIENT_ID')
    INTRA42_CLIENT_SECRET = config('INTRA42_CLIENT_SECRET')
    INTRA42_REDIRECT_URI = config('INTRA42_REDIRECT_URI')
    INTRA42_USERINFO_API = config('INTRA42_USERINFO_API')

    # Google Oauth
    GOOGLE_AUTHORIZE_API = config('GOOGLE_AUTHORIZE_API')
    GOOGLE_CLIENT_ID = config('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = config('GOOGLE_CLIENT_SECRET')
    STATE = config('STATE')

    # SMTP Email
    EMAIL_HOST_USER = config('EMAIL_HOST_USER')
    EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')

else:
    VAULT_URL = env('VAULT_URL')
    VAULT_TOKEN = env('VAULT_TOKEN')
    client = hvac.Client(url=VAULT_URL, token=VAULT_TOKEN)

    wait_for_vault_client(client)
    secret_path = "sejokim"

    read_response = client.secrets.kv.v2.read_secret_version(path=secret_path, mount_point='kv')

    db_host = read_response['data']['data']['DB_HOST']
    db_password = read_response['data']['data']['DB_PASSWORD']
    db_user = read_response['data']['data']['DB_USER']
    db_name = read_response['data']['data']['DB_DATABASE']
    db_port = read_response['data']['data']['DB_PORT']
    LOG_KEY = read_response['data']['data']['LOG_KEY']
    INTRA42_AUTHORIZE_API = read_response['data']['data']['INTRA42_AUTHORIZE_API']
    INTRA42_TOKEN_API = read_response['data']['data']['INTRA42_TOKEN_API']
    INTRA42_CLIENT_ID = read_response['data']['data']['INTRA42_CLIENT_ID']
    INTRA42_CLIENT_SECRET = read_response['data']['data']['INTRA42_CLIENT_SECRET']
    INTRA42_REDIRECT_URI = read_response['data']['data']['INTRA42_REDIRECT_URI']
    INTRA42_USERINFO_API = read_response['data']['data']['INTRA42_USERINFO_API']
    GOOGLE_AUTHORIZE_API = read_response['data']['data']['GOOGLE_AUTHORIZE_API']
    GOOGLE_CLIENT_ID = read_response['data']['data']['GOOGLE_CLIENT_ID']
    GOOGLE_CLIENT_SECRET = read_response['data']['data']['GOOGLE_CLIENT_SECRET']
    STATE = read_response['data']['data']['STATE']
    EMAIL_HOST_USER = read_response['data']['data']['EMAIL_HOST_USER']
    EMAIL_HOST_PASSWORD = read_response['data']['data']['EMAIL_HOST_PASSWORD']
    SECRET_KEY = LOG_KEY

# logging settings

# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'formatters': {
#         'json_formatter': {
#             '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
#             'format': '%(levelname)s %(asctime)s %(module)s %(message)s'
#         },
#     },
#     'handlers': {
#         'logstash': {
#             'level': 'INFO',  # 모든 로그 레벨 포함
#             'class': 'logstash.TCPLogstashHandler',
#             'host': 'logstash_container',  # Logstash 서비스의 컨테이너 이름
#             'port': 5333,  # Logstash 컨테이너가 로그를 수신하는 포트
#             'version': 1,
#             'message_type': 'logstash',
#             'fqdn': False,
#             'tags': ['django'],
#         },
#     },
#     'loggers': {
#         'django': {
#             'handlers': ['logstash'],
#             'level': 'DEBUG',  # 모든 로그 레벨 포함
#             'propagate': True,
#         },
#         # 필요에 따라 추가 로거 정의
#     },
# }

# SECURITY WARNING: don't run with debug turned on in production!

ALLOWED_HOSTS = ['*']

# Application definition

CORS_ALLOW_ALL_ORIGINS = True

INSTALLED_APPS = [
    'users.apps.UsersConfig',
    'pingpong.apps.PingpongConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'drf_yasg',
    'rest_framework_simplejwt',

    "django.contrib.sites",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",

    'django_otp',
    'django_otp.plugins.otp_totp',

    'corsheaders',
]

PINGPONG_TOURNAMENT_MODEL = 'pingpong.Tournament'
AUTH_USER_MODEL = 'users.User'

REST_USE_JWT = True

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'src.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'src.wsgi.application'

if DEBUG:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': env('DB_DATABASE'),
            'USER': env('DB_USER'),
            'PASSWORD': env('DB_PASSWORD'),
            'HOST': env('DB_HOST'),
            'PORT': env('DB_PORT'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': db_name,
            'USER': db_user,
            'PASSWORD': db_password,
            'HOST': db_host,
            'PORT': db_port,
        }
    }

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {
            'access_type': 'online',
        },
    },
}

SOCIALACCOUNT_PROVIDERS['google']['AUTHENTICATION_METHOD'] = 'TOTP'

OTP_TOTP_ISSUER = 'ft_transcendence'

SITE_ID = 2

ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
SOCIAL_AUTH_GOOGLE_OAUTH2_TEST_USER_MODEL = 'users.User'

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_USE_TLS = True
EMAIL_PORT = 587
EMAIL_HOST = 'smtp.gmail.com'
DEFAULT_FROM_MAIL = EMAIL_HOST_USER
# EMAIL_HOST_USER = env('EMAIL_HOST_USER')
# EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')

LANGUAGE_CODE = 'KO'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
