import React from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-elements';

export default class TimeRecord extends React.Component {
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