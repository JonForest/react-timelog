import React from 'react';
import {StyleSheet, Text, TextInput, View, FlatList, AppState, AsyncStorage } from 'react-native';
import { Header, FormLabel, FormInput, Button, Divider } from 'react-native-elements';

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
        // Set up the display variable
        item.displayTime = item.time;
      }
      return item
    })
    this.setState({timelogItems: newRecords});

    // todo: fix shadowed variables.  Maybe extract the map into a helper
    // todo: error if stop within a second, but leave until the correct time handling code is in place
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

class TimeRecord extends React.Component {
  constructor(props) {
    super(props);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.getTime = this.getTime.bind(this);
  }

  leftPadTime(digits) {
    if (String(digits).length < 2) return '0' + digits;
    return digits
  }

  getTime(totalSeconds) {
    if (Number(totalSeconds) === 0) return '00:00:00';

    const hours = Math.floor(totalSeconds / 3600);
    const hoursRemainder = totalSeconds % 3600;
    const minutes = this.leftPadTime(Math.floor(hoursRemainder / 60));
    const seconds = this.leftPadTime(hoursRemainder % 60);
    return `${hours}:${minutes}:${seconds}`;
  }

  start() {
    this.props.startTimer(this.props.record.key);
  }

  stop() {
    this.props.stopTimer(this.props.record.key);
  }

  render() {
    const button = this.props.record.startedTime
      ? <Button small title="Stop" onPress={this.stop} style={{flex:1}} />
      : <Button small title="Start" onPress={this.start} style={{flex:1}} />
    const formattedTime = this.getTime(this.props.record.displayTime);

    return (
      <View style={{flex: 0.5, flexDirection: 'row'}}>
        <Text style={{flex: 1}}>{this.props.record.key}</Text>
        <Text style={{flex: 1}}>{formattedTime}</Text>
        {button}
      </View>
    );
  }
}

class NewRecord extends React.Component {
  input;

  constructor(props) {
    super(props);
    this.setDescription = this.setDescription.bind(this);
    this.sendNewRecord = this.sendNewRecord.bind(this);
    this.state = {description: null}
  }

  sendNewRecord () {
    this.props.createNewRecord(this.state.description);
    this.input.clearText();
    this.input.blur();
    this.setState({description: null})
  }

  render() {
    const button = this.state.description && this.state.description.length
      ? <Button small title="Create" onPress={this.sendNewRecord} />
      : <Button small title="Create" onPress={this.sendNewRecord} disabled />

    return (
      <View style={{flexDirection: 'column'}} >
        <FormLabel>Name</FormLabel>
        <FormInput
          onChangeText={(description) => this.setState({description})}
          ref={ref => this.input = ref}
        />
        {button}
      </View>
    )
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
