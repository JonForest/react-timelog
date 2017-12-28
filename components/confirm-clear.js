import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header, Button, Divider } from 'react-native-elements';


export default class ConfirmClear extends React.Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.clearAll = this.clearAll.bind(this);
  }

  clearAll() {
    const { navigate, state } = this.props.navigation;
    state.params.clearAll();
    navigate('TimeRecordList');
  }

  render() {
    const { navigate } = this.props.navigation;

    return (
      <View>
        <Header centerComponent={{ text: 'Time Log', style: styles.title }}/>
        <Text>Are you sure?</Text>
        <Button
          raised
          backgroundColor='red'
          icon={{name: 'warning'}}
          title='CLEAR'
          onPress={this.clearAll}
        />
        <Button
          raised
          backgroundColor='green'
          icon={{name: 'clear'}}
          title='Cancel'
          onPress={() => navigate('TimeRecordList')}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  }
})