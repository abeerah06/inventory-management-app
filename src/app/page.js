'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, Select, MenuItem, InputLabel, FormControl, Card, CardMedia, CardContent, CardActions, Grid } from '@mui/material'
import { firestore, storage } from '@/firebase'
import { collection, doc, getDocs, query, setDoc, deleteDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#E0F7FA', // Updated Modal Background Color
  border: '2px solid #00796B', // Updated Border Color
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemImage, setItemImage] = useState(null)
  const [count, setCount] = useState('')
  const [itemCategory, setItemCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ id: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `images/${file.name}`)
    await uploadBytes(storageRef, file)
    return await getDownloadURL(storageRef)
  }

  const addItem = async () => {
    let imageUrl = ''
    if (itemImage) {
      imageUrl = await uploadImage(itemImage)
    }

    const newItem = {
      name: itemName,
      image: imageUrl,
      count: count,
      category: itemCategory,
      quantity: 1
    }
    const docRef = doc(collection(firestore, 'inventory'))
    await setDoc(docRef, newItem)
    setItemName('')
    setItemImage(null)
    setCount('')
    setItemCategory('')
    setOpen(false)
    await updateInventory()
  }

  const removeItem = async (id) => {
    await deleteDoc(doc(firestore, 'inventory', id))
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const filteredInventory = inventory.filter(item => item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      p={3}
      sx={{ backgroundColor: '#E0F7FA', overflow: 'auto' }} // Updated Background Color
    >
      <Typography variant="h4" color='#00695C' gutterBottom>
        Inventory
      </Typography>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ backgroundColor: '#FF4081', color: '#FFFFFF', '&:hover': { backgroundColor: '#F50057' } }}>
        Add New Item
      </Button>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mt: 2 }}
        InputProps={{
          style: { backgroundColor: '#B2DFDB' } // Updated Search Bar Color
        }}
      />
      <Grid container spacing={2} sx={{ paddingTop: 2 }}>
        {filteredInventory.map(({ id, name, image, count, category }) => (
          <Grid item xs={12} sm={6} md={4} key={id}>
            <Card sx={{ backgroundColor: '#E0F2F1' }}> {/* Updated Card Color */}
              <CardMedia
                component="img"
                height="140"
                image={image}
                alt={name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" color="#004D40" component="div">
                  {name}
                </Typography>
                <Typography variant="body2" color="#004D40">
                  Count: {count}
                </Typography>
                <Typography variant="body2" color="#004D40">
                  Category: {category}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" onClick={() => removeItem(id)}>
                  Remove
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" color="#00695C">
            Add Item
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              label="Item Image URL"
              type="file"
              variant="outlined"
              fullWidth
              onChange={(e) => setItemImage(e.target.files[0])}
            />
            <TextField
              label="Item Count"
              variant="outlined"
              fullWidth
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
              >
                <MenuItem value="electronics">Electronics</MenuItem>
                <MenuItem value="clothing">Clothing</MenuItem>
                <MenuItem value="groceries">Groceries</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={addItem}
              sx={{ backgroundColor: '#FF4081', color: '#FFFFFF', '&:hover': { backgroundColor: '#F50057' } }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  )
}
