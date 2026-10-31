# KT 4 Express и Multer

## Запуск

В терминале - 

```
npm install
npm start
```

Сервер работает на порту 3001 папки для загруженных файлов создаются автоматически

Создать тестовые файлы

```
Set-Content test.jpg 'fake image content'
Set-Content test.txt 'test'
```

Загрузить аватар

```
curl.exe -X POST http://localhost:3001/upload/avatar -F "avatar=@test.jpg"
```

Проверить ошибку (ожидается 400)

```
curl.exe -X POST http://localhost:3001/upload/avatar -F "avatar=@test.txt"
```

Загрузка два документа

```
curl.exe -X POST http://localhost:3001/upload/documents -F "documents=@test.txt" -F "documents=@test.txt"
```

Отправить профиль

```
curl.exe -X POST http://localhost:3001/upload/profile -F "name=Alice" -F "bio=Backend developer" -F "avatar=@test.jpg"
```

Аватары сохраняются в `uploads/avatars`, документы — в `uploads/documents`.

так же есть ограничения. у аватар до 2 МБ, до 5 документов по 10 МБ каждый
