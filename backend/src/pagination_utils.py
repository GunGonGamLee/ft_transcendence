from src.exceptions import VerificationException


class PaginationUtils:
    @staticmethod
    def validate_page(page):
        try:
            if page is None:
                raise VerificationException('page value is wrong')
            page = int(page)
            return page
        except Exception as e:
            raise VerificationException(f"[{e.__class__.__name__}] {e}")

    @staticmethod
    def validate_limit(limit):
        try:
            if limit is None:
                raise VerificationException('limit value is wrong')
            limit = int(limit)
            if limit <= 0:
                raise VerificationException('limit value is wrong')
            return limit
        except Exception as e:
            raise VerificationException(f"[{e.__class__.__name__}] {e}")
