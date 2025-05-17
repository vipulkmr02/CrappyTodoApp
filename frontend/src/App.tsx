import { ListItemText, Checkbox, Fab, TextField, Dialog, DialogTitle, DialogContent, Button, ListItem, IconButton, Box, Typography } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import List from '@mui/material/List';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface Task {
  _id: string
  title: string
  description: string
  completed: boolean
}

const BASE_URL = 'http://localhost:3000';

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Array<Task>>([]);

  const toggleCompletion = (id: string, current: boolean) => {
    fetch(`${BASE_URL}/update/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ updatedValues: { completed: !current } })
    }).then(res => {
      if (res.status === 200) {
        toast.success("marked " + (current && "undone" || "done"))
        setTasks(tasks.map(task => {
          task._id === id && (() => task.completed = !current)()
          return task
        }))
      } else toast.error("Unable to change status! Server Error")
    })
  }

  const editTask = (idx: number) => {
    const task = tasks[idx];

    fetch(`${BASE_URL}/update/${task._id}`).then(
      (res) => {

      }
    )

  }

  const deleteTask = (id: string) => {
    fetch(`${BASE_URL}/delete/${id}`, {
      method: 'DELETE',
    }).then(res => {
      if (res.status === 200) {
        toast.success("Task Deleted")
        setTasks(tasks.filter((task) => task._id !== id))
      } else toast.error("Unable to delete Task! Server Error")
    })
  }


  const saveTask = () => {
    const titleInput: HTMLInputElement = document.querySelector('#nt-title')!
    const descriptionInput: HTMLInputElement = document.querySelector('#nt-description')!

    fetch(BASE_URL + '/create',
      {
        method: 'PUT',
        body: JSON.stringify({
          title: titleInput.value,
          description: descriptionInput.value
        }),
        headers: {
          "Content-Type": "application/json"
        }
      }
    ).then(res => res.status === 201).then(
      (created) => {
        if (created) toast.success("Task Created")
        else toast.error("Unable to Create Task! Server Error")
      }
    ).finally(() => {
      fetch('http://localhost:3000/tasks')
        .then(res => res.json())
        .then((tasks) => setTasks(tasks.tasks))
    })
  }

  useEffect(() => {
    fetch('http://localhost:3000/tasks')
      .then(res => res.json())
      .then((tasks) => setTasks(tasks.tasks))
  }, [setTasks]);


  return <>
    <Typography variant='h2' sx={{margin: '2rem'}} className="text-center text-3xl">Tasks</Typography>
    <TaskBox tasks={tasks} editTask={editTask} deleteTask={deleteTask} toggleCompletion={toggleCompletion} />
    <Fab sx={{
      position: 'absolute',
      bottom: '1rem',
      right: '1rem'
    }}
      color='primary'
      aria-label='add-task'
      onClick={() => setDialogOpen(!dialogOpen)}
    > <Add /> </Fab>
    <TaskDialog
      dialogOpen={dialogOpen} close={() => setDialogOpen(false)}
      action={saveTask} actionLabel='Save Task' title='New Task' />
  </>
}

function TaskDialog({ title, dialogOpen, close, action, actionLabel }:
  {
    dialogOpen: boolean,
    close: () => void,
    action: () => void,
    actionLabel: string,
    title: string
  }) {
  return <Dialog fullWidth open={dialogOpen} onClose={close}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
      <TextField id="nt-title" sx={{ margin: '1rem' }} variant='outlined' autoFocus required name="title" label="Title" />
      <TextField id="nt-description" sx={{ margin: '1rem' }} variant='outlined' multiline rows={5} required name="description" label="Description" />
      <Button onClick={() => { action(); close() }} variant='contained' sx={{ margin: '1rem' }}> {actionLabel} </Button>
    </DialogContent>
  </Dialog>
}


function TaskBox({ tasks, editTask, deleteTask, toggleCompletion }: {
  tasks: Task[],
  editTask: (idx: number) => void,
  deleteTask: (id: string) => void
  toggleCompletion: (id: string, current: boolean) => void
}) {
  return <>
    <Box className="center-content w-full">
      <List sx={{ overflow:'scroll', maxHeight: '500px', minWidth: '500px' }} className='border'>
        {tasks.length && tasks.map((task, index) => (
          <ListItem key={index}>
            <Checkbox checked={task.completed} onChange={() => toggleCompletion(task._id, task.completed)} />
            <ListItemText primary={task.title} secondary={task.description} />
            <IconButton onClick={() => editTask(index)}><Edit /></IconButton>
            <IconButton onClick={() => deleteTask(task._id)}><Delete /></IconButton>
          </ListItem>
        )) || <Box className="center-content">
            <Typography className='text-center' color='error'>Your tasks will appear here.</Typography>
          </Box>}
      </List>
    </Box>
  </>

}


export default App
