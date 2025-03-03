import pyautogui
import tkinter as tk
import threading

tracking = False

class MouseOverlay:
    def __init__(self):
        self.root = tk.Tk()
        self.root.overrideredirect(True)
        self.root.wm_attributes("-topmost", True)
        self.root.wm_attributes("-transparentcolor", "#000001")

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

        self.update_position()
        self.root.mainloop()

    def update_position(self):
        if tracking:
            x, y = pyautogui.position()
            self.label.config(text=f"🖱 X: {x}, Y: {y}")  
            self.root.geometry(f"+{x+15}+{y+15}")  
        self.root.after(100, self.update_position)

def start_tracking():
    global tracking
    tracking = True
    MouseOverlay()  

def stop_tracking():
    global tracking
    tracking = False

if __name__ == "__main__":
    while True:
        command = input().strip()
        if command == "start":
            threading.Thread(target=start_tracking, daemon=True).start()
        elif command == "stop":
            stop_tracking()