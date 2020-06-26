from pyclick import HumanClicker
import pyautogui
import time

hc = HumanClicker()

def login(username,password):
	#click login button
	hc.move((1500,130),.2)
	hc.click()
	
	#click username tab
	hc.move((1400,325),.11)
	hc.click()

	#delete what is pre-typed
	for _ in range(30):
		pyautogui.press('backspace')
		time.sleep(.1)

	#type new username
	pyautogui.write(username, interval=.1)

	#click password tab
	hc.move((1290,415),.07)
	hc.click()

	#delete what is pre-typed
	for _ in range(20):
		pyautogui.press('backspace')
		time.sleep(.1)

	#type new password
	pyautogui.write(password, interval=.12)

	#click submit
	hc.move((1350,580),.08)
	hc.click()

	time.sleep(5)

def exitAds():
	#exit advertisement
	hc.move((960,252),.1)
	hc.click()
	print("ad closed")

	#scroll down
	pyautogui.scroll(-5000)

def captchaClick():
	#click check box
	hc.move((794,679),.24)
	hc.click()
	time.sleep(3)

	#click roll
	hc.move((944,800),.24)
	hc.click()

def logOut():
	hc.move((1725,130),.24)
	hc.click()
	time.sleep(5)

def rollOne(username,password):
	login(username,password)
	exitAds()
	captchaClick()
	logOut()


if __name__ == '__main__':
	usernames = []
	passwords = []
	f = open("freebitco_accounts.txt")
	accounts_passwords = f.readlines()
	f.close()
	for a in accounts_passwords:
		a = a.split()
		usernames.append(a[0])
		passwords.append(a[1])

	count = -1
	while 1:
		count = (count+1)%len(usernames)
		rollOne(usernames[count],passwords[count])