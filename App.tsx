
 import React, { useEffect, useState } from 'react';
 import {
   ActivityIndicator,
   SafeAreaView,
   ScrollView,
   StatusBar,
   StyleSheet,
   TouchableOpacity,
   Text,
   View,
   TextInput,
 } from 'react-native';
 import { API_HOST } from 'react-native-dotenv'

export interface Todo {
  id: number | null;
  title: string;
  done: boolean;
}

export default function App() {
    const [isLoading, setLoading] = useState<boolean>(true);
    const [newTodo, setNewTodo] = useState<string>("");
    const [todoList, setTodos] = useState<Todo[]>([]);

    useEffect(() => {
      console.log('fetching todos...');
      fetch(`${API_HOST}/todos.json`)
        .then((response) => response.json())
        .then((todoJson) => setTodos(todoJson))
        .catch((error) => console.log(error))
        .finally(() => setLoading(false));
    }, []);

    const toggleTodo = (todoIndex: number) : void => {
      var todo = todoList[todoIndex];
      todo.done = !todo.done;

      setLoading(true);

      fetch(`${API_HOST}/todos/${todo.id}/`, { 
        method: 'PUT', 
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(todo)
      })
        .then((response) => response.json())
        .then((updatedTodo) => {
          const updatedTodos = [...todoList];
          updatedTodos[todoIndex] = updatedTodo;
          setTodos(updatedTodos);
        })
        .catch((error) => console.log(error))
        .finally(() => setLoading(false));
    }

    const addTodo = (todoItem: string) : void => {
      if (todoItem === '') {
        return;
      }

      setLoading(true);

      const todo: Todo = { id: null, title: todoItem, done: false };
      fetch(`${API_HOST}/todos/`, { 
        method: 'POST', 
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(todo)
      })
        .then((response) => response.json())
        .then((newTodo) => setTodos([...todoList, newTodo]))
        .catch((error) => console.log(error))
        .finally(() => setLoading(false));
      setNewTodo(''); 
    }

    const removeTodos = () : void => {
      const removedIds = [...todoList.filter(t => t.done)].map(t => t.id);

      setLoading(true);

      fetch(`${API_HOST}/todos/`, { 
        method: 'DELETE', 
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ids: removedIds})
      })
        .then((_) => {
          const updatedTodos = [...todoList.filter(t => !t.done)];
          setTodos(updatedTodos);
        })
        .catch((error) => console.log(error))
        .finally(() => setLoading(false));
    }

    return (
      <SafeAreaView>
        <StatusBar barStyle={'light-content'}></StatusBar>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Todos ({todoList.filter((t) => !t.done).length})</Text>
        </View>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View>
            { isLoading ? <ActivityIndicator/> : (
              todoList.map((todo: Todo, index: number) => (
                <TouchableOpacity key={todo.id} onPress={(e) => toggleTodo(index)} style={[styles.todo, todo.done ? styles.todoDone : styles.todoOpen]}>
                  <Text testID="todoTitle" style={[todo.done ? styles.todoDoneText : styles.todoDoneOpen]}>
                  {todo.title}
                  </Text>
                </TouchableOpacity>
              )))
            }
          </View>
        </ScrollView>
        <TextInput style={styles.newTodo} 
                   placeholder="Yet another thing..." 
                   value={newTodo} 
                   blurOnSubmit={false}
                   onSubmitEditing={e => addTodo(newTodo)} 
                   onChangeText={(e) => setNewTodo(e)}
                   testID="newTodoInput"></TextInput>
        <TouchableOpacity style={styles.removeTodos} onPress={(e) => removeTodos()} disabled={todoList.length === 0}><Text>Remove Completed</Text></TouchableOpacity>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row'
  },
  sectionTitle: {
    backgroundColor: '#9689c4',
    padding: 15,
    width: '100%',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 5,
  },
  todo: {
    minHeight: 30,
    width: '100%',
    padding: 15,
    marginBottom: 5
  },
  todoDone: {
    backgroundColor: '#f1eff7'
  },
  todoOpen: {
    backgroundColor: '#d2d4d2'
  },
  todoDoneText: {
    textDecorationLine: 'line-through'
  },
  todoDoneOpen: {
    fontWeight: 'bold'
  },
  removeTodos: {
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    minHeight: 40,
    backgroundColor: '#c4b389',
    marginTop: 3
  },
  newTodo: {
    borderColor: '#e8e8e8',
    borderWidth: 1,
    padding: 5,
    margin: 2,
    height: 40
  }
});
