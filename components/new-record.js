import React from 'react';
import { View } from 'react-native';
import { FormLabel, FormInput, Button } from 'react-native-elements';

export default class NewRecord extends React.Component {
  input;

  constructor(props) {
    super(props);
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