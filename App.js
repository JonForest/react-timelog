import { StackNavigator } from 'react-navigation';
import TimeRecordList from './components/time-record-list'
import ConfirmClear from './components/confirm-clear'

export default App = StackNavigator({
  TimeRecordList: { screen: TimeRecordList },
  ConfirmClear: { screen: ConfirmClear }
});