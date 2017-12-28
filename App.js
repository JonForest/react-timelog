import React from 'react';
import {StyleSheet, Text, View, FlatList, AsyncStorage } from 'react-native';
import { Header, Button, Divider } from 'react-native-elements';
import TimeRecord from './components/time-record'
import NewRecord from './components/new-record'

const STORAGENAME = 'timelogItems'

export default class App extends React.Component {

  constructor(props) {
    super(props);
    // todo: load the state from the local storage, whatever that is
    // todo: work out the state structure for this app

    this.state = {
     timelogItems: [
       {key: 'Work for Dennis', time: 0, displayTime: 0}
     ]
    }

    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.createNewRecord = this.createNewRecord.bind(this);
    this.clearAll = this.clearAll.bind(this);

    AsyncStorage.getItem(STORAGENAME, (err, itemsString) => {
      if (err) console.error(`Failed to load from memory: ${err}`)
      console.log(itemsString);
      if (itemsString) this.setState({timelogItems: JSON.parse(itemsString)})
    });
  }

  componentDidMount() {
    console.log('did mount');
    // Save periodically, every 5 seconds in case of being unable to catch an 'off' event
    this.storageTimer = setTimeout(() => {
      AsyncStorage.setItem(STORAGENAME, JSON.stringify(this.state.timelogItems));
    }, 5000)
  }

  componentWillUnmount() {
    AsyncStorage.setItem(STORAGENAME, JSON.stringify(this.state.timelogItems));
    clearInterval(this.storageTimer);
  }

  // todo: app needs to be in the foreground for this to work
  // look to https://github.com/ocetnik/react-native-background-timer
  // Or, simply use a couple of Dates to cope for when the app is closed - events for app returning from sleep and
  // comparing against the date
  startTimer(key) {
    // Set the started flag immediately
    const newRecords = this.state.timelogItems.map(item => {
      if (item.key === key) {
        item.startedTime = Date.now();
        item.displayTime = item.time;
      }
      return item
    })
    this.setState({timelogItems: newRecords});

    // Start and run the timer for display purposes (to show 'counting')
    this.runClock(key);
  }

  runClock (key) {
    let timer = setInterval(() => {
      const newRecords = this.state.timelogItems.map(item => {
        if (item.key === key) {
          item.displayTime++;
          item.timer = timer;
        }
        return item;
      })
      this.setState({timelogItems: newRecords});
    }, 1000);
  }

  stopTimer(key) {
    const record = this.state.timelogItems.find(item => item.key === key);
    // Stop time out running
    clearTimeout(record.timer);

    // Work out how long the timer has been running for, update the time and clear the startedTime
    const finishedTime = Date.now();
    const totalTime = Math.floor((finishedTime - record.startedTime) / 1000);
    record.time += totalTime;
    record.displayTime = record.time;
    record.startedTime = null;

    // Set state, and also save to permanent storage
    // TODO: move all setState commands to also save to storage
    this.setState(JSON.parse(JSON.stringify(this.state)), () => {
      console.log(this.state)
      AsyncStorage.setItem(STORAGENAME, JSON.stringify(this.state.timelogItems))
    });
  }

  createNewRecord(description) {
    const newState = JSON.parse(JSON.stringify(this.state));
    newState.timelogItems.push({
      key: description,
      time: 0,
      displayTime: 0
    });
    this.setState(newState);
  }

  clearAll() {
    this.setState({timelogItems: []}, () => {
      console.log(this.state);
      AsyncStorage.setItem(STORAGENAME, JSON.stringify([]));
    });
  }

  render() {
    const clearButton = this.state.timelogItems.length
      ? <Button title="Clear" onPress={this.clearAll} />
      : <Button title="Clear" onPress={this.clearAll} disabled />

    const listOrText = this.state.timelogItems.length
      ? <FlatList style={{padding: 5}}
                  data={this.state.timelogItems}
                  renderItem={({item}) => <TimeRecord record={item} startTimer={this.startTimer} stopTimer={this.stopTimer} />}
        />
      : <Text>No items logged</Text>

    return (
      <View>
        <Header centerComponent={{ text: 'Time Log', style: styles.title }}/>
        <NewRecord style={{height: 500}} createNewRecord={this.createNewRecord} />
        <Divider style={styles.divider} />
        {listOrText}
        {clearButton}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: 'blue'
  }
});
