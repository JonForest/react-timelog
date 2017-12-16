import React from 'react';
import {StyleSheet, Text, TextInput, View, FlatList, Button} from 'react-native';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    // todo: load the state from the local storage, whatever that is
    // todo: work out the state structure for this app
    this.state = {
     timelogItems: [
       {key: 'Work for Dennis', time: 6000, started: false}
     ]
    }
  }

  render() {
    return (
      <View style={{padding: 50}}>
        <FlatList
          data={this.state.timelogItems}
          renderItem={({item}) => <TimeRecord record={item}/>}
        />
      </View>
    );
  }
}

class TimeRecord extends React.Component {
  time() {
    const totalSeconds = this.props.record.time;
    const hours = Math.floor(totalSeconds / 3600);
    const hoursRemainder = totalSeconds % 3600;
    const minutes = Math.floor(hoursRemainder / 60);
    const minutesRemainder = hoursRemainder / 60;
    const seconds = Math.floor(minutesRemainder);
    return `${hours}:${minutes}:${seconds}`;
  }

  noop() {
    return;
  }

  render() {
    const button = this.props.record.started
      ? <Button title="Stop" onPress={this.noop} style={{flex:1}} />
      : <Button title="Start" onPress={this.noop} style={{flex:1}} />
    return (
      <View style={{flex: 0.5, flexDirection: 'row'}}>
        <Text style={{flex: 1}}>{this.props.record.key}</Text>
        <Text style={{flex: 1}}>{this.time()}</Text>
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
