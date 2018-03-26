from flask import Flask
from config import constants

class MyFlask(Flask):
    def get_send_file_max_age(self, name):
        if name.startswith('js/') or name.startswith('css/'):
            return 0
        return super(MyFlask, self).get_send_file_max_age(name)

app = MyFlask(__name__,
    template_folder=constants.TEMPLATE_ROOT,
    static_folder=constants.STATIC_ROOT)