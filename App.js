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
       {key: 'Work for Dennis', time: 4000, started: false}
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
    this.storageTimer = setTimeout(() => {
      AsyncStorage.setItem(STORAGENAME, JSON.stringify(this.state.timelogItems));
    })
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
        item.started = true;
      }
      return item
    })
    this.setState({timelogItems: newRecords});

    // todo: fix shadowed variables.  Maybe extract the map into a helper
    // todo: error if stop within a second, but leave until the correct time handling code is in place
    let timer = setInterval(() => {
      const newRecords = this.state.timelogItems.map(item => {
        if (item.key === key) {
          item.time++;
          item.timer = timer;
        }
        return item;
      })
      this.setState({timelogItems: newRecords});
    }, 1000);
  }

  stopTimer(key) {
    const record = this.state.timelogItems.find(item => item.key === key);
    clearTimeout(record.timer);
    record.started = false;
    this.setState(JSON.parse(JSON.stringify(this.state)), () => {
      console.log(this.state)
      AsyncStorage.setItem(STORAGENAME, JSON.stringify(this.state.timelogItems))
    });
  }

  createNewRecord(description) {
    const newState = JSON.parse(JSON.stringify(this.state));
    newState.timelogItems.push({
      key: description,
      time: 0
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
    console.log('render called' + this.props.record.time);
    const button = this.props.record.started
      ? <Button small title="Stop" onPress={this.stop} style={{flex:1}} />
      : <Button small title="Start" onPress={this.start} style={{flex:1}} />
    const formattedTime = this.getTime(this.props.record.time);
    console.log(formattedTime)

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
  description;

  constructor(props) {
    super(props);
    this.setDescription = this.setDescription.bind(this);
    this.sendNewRecord = this.sendNewRecord.bind(this);
  }

  setDescription(description) {
    console.log(description);
    this.description = description;
  }

  sendNewRecord () {
    this.props.createNewRecord(this.description);
    this.description = '';
  }

  render() {
    return (
      <View style={{flexDirection: 'column'}} >
        <FormLabel>Name</FormLabel>
        <FormInput onChangeText={this.setDescription} />
        <Button
          small
          title="Create"
          onPress={this.sendNewRecord} />
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
