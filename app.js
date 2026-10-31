const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 3001

// Создаём папки для загруженных файлов
const avatarsFolder = path.join(__dirname, 'uploads', 'avatars')
const documentsFolder = path.join(__dirname, 'uploads', 'documents')

fs.mkdirSync(avatarsFolder, { recursive: true })
fs.mkdirSync(documentsFolder, { recursive: true })

// Настройки сохранения аватаров
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarsFolder)
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + '-' + file.originalname
    cb(null, fileName)
  }
})

// Настройки сохранения документов
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, documentsFolder)
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + '-' + file.originalname
    cb(null, fileName)
  }
})

// Разрешаем только изображения
function imageFilter(req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Можно загружать только изображения'))
  }
}

// Разрешаем обычные документы
function documentFilter(req, file, cb) {
  const allowedTypes = [
    'text/plain',
    'text/csv',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Можно загружать только документы'))
  }
}

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
})

const uploadDocuments = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
})

// Один аватар
app.post('/upload/avatar', uploadAvatar.single('avatar'), function (req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' })
  }

  res.status(201).json({
    message: 'Аватар загружен',
    file: {
      name: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    }
  })
})

// Несколько документов
app.post('/upload/documents', uploadDocuments.array('documents', 5), function (req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Файлы не загружены' })
  }

  const files = req.files.map(function (file) {
    return {
      name: file.filename,
      originalName: file.originalname,
      size: file.size,
      type: file.mimetype
    }
  })

  res.status(201).json({
    message: 'Документы загружены',
    files: files
  })
})

// Профиль: текстовые поля и аватар вместе
app.post('/upload/profile', uploadAvatar.fields([
  { name: 'avatar', maxCount: 1 }
]), function (req, res) {
  if (!req.body.name) {
    return res.status(400).json({ error: 'Поле name обязательно' })
  }

  const avatar = req.files && req.files.avatar ? req.files.avatar[0] : null

  res.status(201).json({
    message: 'Профиль загружен',
    profile: {
      name: req.body.name,
      bio: req.body.bio || '',
      avatar: avatar ? avatar.filename : null
    }
  })
})

// Показываем ошибки загрузки понятным сообщением
app.use(function (error, req, res, next) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Файл слишком большой' })
  }

  res.status(400).json({ error: error.message })
})

app.listen(PORT, function () {
  console.log('Сервер запущен: http://localhost:' + PORT)
})
