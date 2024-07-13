## PROPERDM

### Instruction to run APPLICATION

#### GIT FORK THE PROJECT and CLONE it Locally

#### TO RUN BACKEND

- cd backend/
- [OPTIONAL] `tsc -b && rm -rf dist/data && mkdir dist/data/ && cp -r src/data/* ./dist/data/`
- npm install
- cd src/ && mkdir data && cd data/ && touch chats.json
- cd ../../
- npm run dev

#### TO RUN FRONTEND

- cd frontend/
- npm install
- npm run dev

### SCREENSHOT's

##### ROUTE : ALl Chats

![image](https://github.com/user-attachments/assets/0af1475a-bf74-41af-b4b8-c6dcfe321162)

##### ROUTE : Single Chat

![image](https://github.com/user-attachments/assets/0d810b1d-d19b-41e1-938f-5a75b3a957ba)

### ToDo's

- [ ] Chat Creation is broken
- [ ] Polling functionality
- [ ] profile picture displaying
- [ ] chat is readed/unreaded {displaying}
- [ ] user auth/social login
- [ ] Key-board navigation for iterating chat list
- [ ] Showing counts and handling count of chats in unread tab
- [ ] Mark as read option in list view only.
- [ ] Undo for mark as read
- [ ] Bookmark feature and tab
