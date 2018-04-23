import apilib
from bidict import bidict
import six


def req_error(code=None, path=None, message=None):
    error = apilib.ApiError(code=code, path=path, message=message)
    return apilib.ApiException.request_error(errors=[error])


class DbToApiMapping(object):
    def __init__(self, db_column_to_api_field_dict):
        self.db_column_to_api_field_dict = bidict(db_column_to_api_field_dict)
        self.api_fields_by_name = {
            f._name: f for f in six.itervalues(db_column_to_api_field_dict)}

    def api_field_for_name(self, api_field_name):
        return self.api_fields_by_name.get(api_field_name)

    def db_column_for_api_field_name(self, api_field_name):
        api_field = self.api_field_for_name(api_field_name)
        if api_field is None:
            return None
        return self.db_column_to_api_field_dict.inv.get(api_field)


def apply_pagination(
        query,
        api_pagination,
        default_start=None,
        default_num=None):
    start = default_start
    num = default_num
    if api_pagination and api_pagination.start is not None:
        start = api_pagination.start
    if api_pagination and api_pagination.num is not None:
        num = api_pagination.num

    if start is None and num is None:
        return query
    if start is None and num is not None:
        return query.limit(num)
    if start is not None and num is None:
        return query.offset(start)
    return query.slice(start, start + num)


def apply_ordering(
        query,
        api_ordering,
        db_to_api_mapping,
        default_ordering=None):
    api_criteria = api_ordering.criteria if api_ordering and api_ordering.criteria else []
    db_columns = []
    for api_criterion in api_criteria:
        db_column = db_to_api_mapping.db_column_for_api_field_name(
            api_criterion.field_name)
        if db_column:
            if api_criterion.direction == apilib.OrderingDirection.DESC:
                db_column = db_column.desc()
            db_columns.append(db_column)
    if not db_columns and default_ordering is not None:
        # Provide at least some stable kind of ordering
        if type(default_ordering) not in (list, tuple):
            default_ordering = [default_ordering]
        return query.order_by(*default_ordering)
    return query.order_by(*db_columns)
