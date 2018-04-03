import subprocess
import unittest

class PyflakesTest(unittest.TestCase):
    def test_no_pyflakes_warnings(self):
        process = subprocess.Popen(
            '''find . -name '*.py' | grep -v apilib | xargs pyflakes''',
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE)
        process.wait()
        if process.returncode != 0:
            self.fail('One or more pyflakes warnings were found:\n%s' % process.stdout.read().decode('utf-8'))

if __name__ == '__main__':
    unittest.main()
