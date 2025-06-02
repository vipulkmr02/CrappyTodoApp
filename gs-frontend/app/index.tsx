import React from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "react-native";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { CheckIcon, CloseIcon, Icon, AddIcon, TrashIcon, ArrowRightIcon } from "@/components/ui/icon";
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "@/components/ui/checkbox";
import { Pressable } from "@/components/ui/pressable";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { FormControl, FormControlLabel } from "@/components/ui/form-control";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";

interface Task {
  _id?: string
  title: string
  description: string
  completed?: boolean
}
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function App() {
  const [tasks, setTasks] = React.useState<Task[] | null>(null);

  const deleteTask = (id: string) => {
    fetch(`${API_URL}delete/${id}`, {
      method: 'DELETE',
    }).then(res => {
      if (res.status === 200)
        tasks &&
          setTasks(tasks.filter((task) => task._id !== id))
    })
  }

  const saveTask = (task: Task) => {
    return fetch(API_URL + 'create', {
      method: "PUT",
      body: JSON.stringify(task),
      headers: {
        "Content-Type": "application/json"
      }
    })
  }

  const getTasks = () => {
    if (!API_URL) {
      console.error("Couldn't find API URL")
      return;
    }
    else {
      // Non-SSE mode

      // return fetch(API_URL + "tasks")
      //   .then(res => {
      //     if (res.ok) return res.json()
      //   }).then(json => {
      //     setTasks(json.tasks)
      //   })

      // SSE mode

      const taskListSource = new EventSource(API_URL + 'tasksSub')

      taskListSource.onopen = (event) => {
        console.log('tasks subscribed!')
        const updatedData = (event as MessageEvent).data
        updatedData && setTasks(JSON.parse(updatedData).tasks)
      }

      taskListSource.onmessage = (event) => {
        const receivedData = (event as MessageEvent).data
        const updatedTasks = JSON.parse(receivedData)
        updatedTasks && setTasks(updatedTasks.tasks)
        console.log(updatedTasks)
      }
    }
  }

  React.useEffect(() => {
    getTasks()
  }, [setTasks])

  const toggleTaskCompletion = (task: Task) => {
    if (!API_URL) {
      console.error("Couldn't find API URL")
      return;
    } else return fetch(API_URL + `update/${task._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        updatedValues: {
          completed: !task.completed
        }
      })
    })
  }
  const [ntfActive, setNtfActive] = React.useState(false);
  const [etActive, setEtActive] = React.useState(-1);

  return (<>
    <NewTaskForm active={ntfActive} submitHandler={saveTask} closeHandler={() => setNtfActive(false)} />
    {etActive !== -1 && <EnlargeTask task={tasks && tasks[etActive] || {} as Task} closeHandler={() => setEtActive(-1)} />}
    <Box className="h-[100vh] md:px-32 sm:px-0">
      <ScrollView style={{ height: "100%" }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Box className="bg-black p-3 md:mx-4 md:rounded-2xl md:rounded-t-none shadow shadow-black sticky top-0 z-50 flex flex-row items-center justify-between">
          <Heading size="3xl" className="sm:2xl text-center text-white">
            Crappy Todo App
          </Heading>
          <Pressable onPress={() => { setNtfActive(true) }}>
            {({ hovered }: { hovered: boolean }) => {
              return <Icon as={AddIcon}
                className={hovered ? " text-blue-500" : "text-white"}
                size="xl" />
            }}
          </Pressable>
        </Box>

        <Box style={{ height: "100%" }} className="h-full md:w-3/5 sm:w-5/6 md:mx-auto md:px-8">
          {tasks && tasks?.length > 0 && <VStack> {
            tasks.map((task, idx) => {
              return <HStack key={idx} className="rounded hover:bg-gray-100 p-3 justify-between items-center">
                <Checkbox
                  key={task._id}
                  size='sm'
                  isChecked={task.completed}
                  value={task.title}
                  onChange={() => {
                    toggleTaskCompletion(task)?.finally(() => {
                      getTasks()
                    })
                  }}
                > <CheckboxIndicator>
                    <CheckboxIcon as={CheckIcon} size="lg" />
                  </CheckboxIndicator>
                  <CheckboxLabel>{task.title}</CheckboxLabel>
                </Checkbox>
                <HStack className="flex gap-2">
                  <Pressable onPress={() => task._id && deleteTask(task._id)} >
                    {({ hovered }: { hovered: boolean }) => {
                      const rv = <Icon
                        as={TrashIcon}
                        size="xs"
                        className={`${hovered ? "stroke-red-500" : "stroke-primary-50"}`}
                      />
                      return rv;
                    }}
                  </Pressable>
                  <Pressable onPress={() => task._id && deleteTask(task._id)} >
                    {({ hovered }: { hovered: boolean }) => {
                      const rv = <Icon
                        as={ArrowRightIcon}
                        size="xs"
                        className={`${hovered ? "stroke-blue-500" : "stroke-primary-50"}`}
                      />
                      return rv;
                    }}
                  </Pressable>
                </HStack>
              </HStack>
            })} </VStack>}
          {tasks && tasks.length === 0 && <Box id="no" style={{ height: "100%" }}
            className="flex flex-row justify-center text-2xl items-center">
            <Icon as={CloseIcon} size="xl" className="text-gray-500" />
            <Text className="p-4 text-2xl text-center text-gray-500">No Tasks Found</Text>
          </Box>}
        </Box>
      </ScrollView>
    </Box>
  </>
  );
}


function NewTaskForm({ active, submitHandler, closeHandler }:
  {
    active: boolean,
    submitHandler: (x: Task) => Promise<Response>,
    closeHandler: () => void
  }) {
  return <>
    {
      active &&
      <Box className="sm:w-full fixed backdrop-brightness-50 inset-0 flex justify-center items-center z-50">
        <Box className="p-5 bg-white rounded shadow flex items-center justify-center ">
          <VStack className="grid gap-1">
            <HStack className="flex items-center pb-4 justify-between">
              <Heading size="2xl" className="">New Task</Heading>
              <Pressable onPress={closeHandler}> <Icon size="md" as={CloseIcon} /> </Pressable>
            </HStack>

            <FormControl>
              <FormControlLabel className="text-1xl">Title</FormControlLabel>
              <Input isRequired={true} variant="outline" size="sm"> <InputField id='ntf-title' /> </Input>
            </FormControl>

            <FormControl>
              <FormControlLabel className="text-1xl">Description</FormControlLabel>
              <Textarea size="sm"> <TextareaInput id='ntf-description' /> </Textarea>
            </FormControl>

            <Button onPress={() => {
              const task: Task = {
                title: (document.getElementById('ntf-title') as HTMLInputElement)?.value,
                description: (document.getElementById('ntf-description') as HTMLInputElement)?.value
              }
              submitHandler(task).then(closeHandler)
            }}> <ButtonText>Save</ButtonText> </Button>
          </VStack>
        </Box>
      </Box>
    }
  </>
}


function EnlargeTask({ task, closeHandler }:
  {
    task: Task, closeHandler: () => void,
  }) {
  return <> <Box className="sm:w-full fixed backdrop-brightness-50 inset-0 flex justify-center items-center z-50">
    <Box className="p-5 md:w-72 sm:w-full bg-white rounded shadow">
      <HStack className="flex justify-between items-center pb-2">
        <Heading size="md" className="font-bold">{task.title}</Heading>
        <Button variant="solid" onPress={closeHandler} className="bg-none">
          <ButtonIcon as={CloseIcon} className="text-black hover:text-red-500 " />
        </Button>
      </HStack>
      <Box className="border">
        <Text className="text-gray-800"> {task.description} </Text>
      </Box>
    </Box>
  </Box>
  </>
}
