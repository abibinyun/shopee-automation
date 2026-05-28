import pyautogui
import tkinter as tk
import threading
import queue
import sys
import os

class MouseOverlay:
    def __init__(self, command_queue):
        self.root = tk.Tk()
        self.root.overrideredirect(True)
        self.root.wm_attributes("-topmost", True)
        self.root.wm_attributes("-alpha", 0.7)
        self.root.config(bg="black")

        self.label = tk.Label(
            self.root,
            font=("Arial", 14, "bold"),
            fg="white",
            bg="black",
            padx=10, pady=5,
            relief="solid",
            bd=2,
        )
        self.label.pack()

        self.command_queue = command_queue
        self.tracking = False

        self.update_position()
        self.check_commands()
        self.root.mainloop()

    def update_position(self):
        if self.tracking:
            x, y = pyautogui.position()
            self.label.config(text=f"🖱 X: {x}, Y: {y}")
            self.root.geometry(f"+{x+15}+{y+15}")
            try:
                print(f'{{"x": {x}, "y": {y}}}')
                sys.stdout.flush()
            except:
                pass
        self.root.after(100, self.update_position)

    def check_commands(self):
        try:
            cmd = self.command_queue.get_nowait()
        except queue.Empty:
            cmd = None

        if cmd == "start":
            self.tracking = True
        elif cmd == "stop":
            self.tracking = False
        elif cmd == "exit":
            self.root.destroy()
            sys.exit(0)

        self.root.after(100, self.check_commands)


def main():
    cmd_queue = queue.Queue()
    is_interactive = sys.stdin.isatty()

    def input_thread():
        while True:
            try:
                if is_interactive:
                    cmd = input("Command (start/stop/exit): ").strip()
                else:
                    cmd = sys.stdin.readline().strip()
                if cmd:
                    cmd_queue.put(cmd)
                    if cmd == "exit":
                        break
            except EOFError:
                break

    threading.Thread(target=input_thread, daemon=True).start()
    MouseOverlay(cmd_queue)

if __name__ == "__main__":
    main()
