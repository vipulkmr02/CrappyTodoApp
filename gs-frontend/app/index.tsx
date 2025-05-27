import React from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "react-native";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/Themed";
import { CheckIcon, CloseIcon } from "@/components/ui/icon";
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "@/components/ui/checkbox";
import { Pressable } from "@/components/ui/pressable";

interface Task {
  _id: string
  title: string
  description: string
  completed: boolean
}
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Home() {
  const [tasks, setTasks] = React.useState<Task[]>([]);

  const getTasks = () => {
    if (!API_URL) {
      console.error("Couldn't find API URL")
      return;
    } else return fetch(API_URL + "tasks")
      .then(res => {
        if (res.ok) return res.json()
      }).then(json => {
        console.log(json)
        setTasks(json.tasks)
      })
  }

  React.useEffect(() => {
    getTasks()?.finally(() => console.log("Tasks fetched"))
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

  return (
    <Box className="flex-1 h-[100vh]">
      <ScrollView style={{ height: "100%", padding: 20 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Box style={{ height: "100%" }}>
          <Box>
            <Heading size="3xl" className="text-center">
              Crappy Todo App
            </Heading>
          </Box>

          <Box className="w-3/5 mx-auto p-8"><VStack>
            {tasks?.length > 0 &&
              tasks.map((task, idx) => {
                return <Pressable><Checkbox
                  key={task._id}
                  size='sm'
                  isChecked={task.completed}
                  value={task.title}
                  style={{ padding: 10 }}
                  className="hover:bg-gray-100"
                  onChange={() => {
                    toggleTaskCompletion(task)?.finally(() => {
                      getTasks()
                    })
                  }}
                >
                  <CheckboxIndicator>
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                  <CheckboxLabel>{task.title}</CheckboxLabel>
                </Checkbox></Pressable>
              })}
            {tasks.length === 0 && <Box>
              <Text className="text-center">
                No Tasks
              </Text>
            </Box>}
          </VStack>
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
}
