from pathlib import Path

from decouple import config
import environ
import os
import hvac
import time
from pythonjsonlogger import jsonlogger

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR_PATH = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR_PATH / '.env'
env = environ.Env()
DEBUG = False
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
    BASE_URL = config('BASE_URL')
    INTRA42_AUTHORIZE_API = config('INTRA42_AUTHORIZE_API')
    INTRA42_TOKEN_API = config('INTRA42_TOKEN_API')
    INTRA42_CLIENT_ID = config('INTRA42_CLIENT_ID')
    INTRA42_CLIENT_SECRET = config('INTRA42_CLIENT_SECRET')
    INTRA42_USERINFO_API = config('INTRA42_USERINFO_API')

    # Google Oauth
    GOOGLE_AUTHORIZE_API = config('GOOGLE_AUTHORIZE_API')
    GOOGLE_CLIENT_ID = config('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = config('GOOGLE_CLIENT_SECRET')
    STATE = config('STATE')

    # SMTP Email
    EMAIL_HOST_USER = config('EMAIL_HOST_USER')
    EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')

    # JWT
    JWT_EMAIL_SECRET_KEY = config('JWT_EMAIL_SECRET_KEY')
    JWT_AUTH_SECRET_KEY = config('JWT_AUTH_SECRET_KEY')

else:
    VAULT_URL = env('VAULT_URL')
    VAULT_TOKEN = env('VAULT_TOKEN')
    client = hvac.Client(url=VAULT_URL, token=VAULT_TOKEN, verify='/backend/certs/rootCA.pem')

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
    INTRA42_USERINFO_API = read_response['data']['data']['INTRA42_USERINFO_API']
    GOOGLE_AUTHORIZE_API = read_response['data']['data']['GOOGLE_AUTHORIZE_API']
    GOOGLE_CLIENT_ID = read_response['data']['data']['GOOGLE_CLIENT_ID']
    GOOGLE_CLIENT_SECRET = read_response['data']['data']['GOOGLE_CLIENT_SECRET']
    STATE = read_response['data']['data']['STATE']
    EMAIL_HOST_USER = read_response['data']['data']['EMAIL_HOST_USER']
    EMAIL_HOST_PASSWORD = read_response['data']['data']['EMAIL_HOST_PASSWORD']
    JWT_EMAIL_SECRET_KEY = read_response['data']['data']['JWT_EMAIL_SECRET_KEY']
    JWT_AUTH_SECRET_KEY = read_response['data']['data']['JWT_AUTH_SECRET_KEY']
    BASE_URL = config('BASE_URL')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'simple': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/djangolog/django.log',
        },
    },
    'loggers': {
        '': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        # 'django.request': {
            # 'handlers': ['console', 'file'],
            # 'level': 'WARN',
            # 'propagate': False,
        # },
        # 'django.security': {
            # 'handlers': ['console', 'file'],
            # 'level': 'WARN',
            # 'propagate': False,
        # }
    }
}

# SECURITY WARNING: don't run with debug turned on in production!

ALLOWED_HOSTS = ['*']

CORS_ALLOW_ALL_ORIGINS = True
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://localhost:8000",
# ]
# Application definition

INSTALLED_APPS = [
    'corsheaders',
    'channels',
    'users.apps.UsersConfig',
    'games.apps.GamesConfig',
    'friends.apps.FriendsConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'drf_yasg',
    'rest_framework_simplejwt',
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'django_prometheus',
]

ELASTICSEARCH_DSL = {
    'default': {
        'hosts': 'localhost:9200'
    },
}

AUTH_USER_MODEL = 'users.User'

REST_USE_JWT = True

MIDDLEWARE = [
    'django_prometheus.middleware.PrometheusBeforeMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_prometheus.middleware.PrometheusAfterMiddleware',
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

ASGI_APPLICATION = "src.asgi.application"
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    }
}
use_websockets = True
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

SITE_ID = 2

ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
SOCIAL_AUTH_GOOGLE_OAUTH2_TEST_USER_MODEL = 'users.User'

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_USE_TLS = True
EMAIL_PORT = 587
EMAIL_HOST = 'smtp.gmail.com'
DEFAULT_FROM_MAIL = EMAIL_HOST_USER

LANGUAGE_CODE = 'KO'
TIME_ZONE = 'Asia/Seoul'

USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Cookie settings
SESSION_COOKIE_HTTPONLY = True

# Assets Root
FRONTEND_ROOT = Path(BASE_DIR).parent / 'frontend'
MEDIA_ROOT = os.path.join(FRONTEND_ROOT, 'assets', 'images')
MEDIA_URL = '/images/'
