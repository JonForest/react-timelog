import React from 'react';
import {StyleSheet, Text, TextInput, View, FlatList, Button} from 'react-native';

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
  }

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
    this.setState(JSON.parse(JSON.stringify(this.state)));
  }

  render() {
    return (
      <View style={{padding: 50}}>
        <FlatList
          data={this.state.timelogItems}
          renderItem={({item}) => <TimeRecord record={item} startTimer={this.startTimer} stopTimer={this.stopTimer} />}
        />
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
    console.log('stop')
    this.props.stopTimer(this.props.record.key);
  }

  render() {
    console.log('render called' + this.props.record.time);
    const button = this.props.record.started
      ? <Button title="Stop" onPress={this.stop} style={{flex:1}} />
      : <Button title="Start" onPress={this.start} style={{flex:1}} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
