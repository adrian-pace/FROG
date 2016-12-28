import React, { Component } from 'react';
import Activity from './Activity.jsx';
import { Activities } from '../../api/activities.js';

export default class ActivityEditor extends Component {

  handleSubmit() {
    if(!this.refs.newActivity.haveFieldsCompleted()) {
      alert("Not all fields have been filled !");
    }
    else if(!this.refs.newActivity.areAnswersInChoices()){
      alert("Not all answers are in the choices !");
    }
    else {
      var item = this.refs.newActivity.generateActivity();
      Activities.remove(item['_id']);
      Activities.insert(item);
      alert("Your actitvity has been added in the repository.");
    }
  }

  render() {
    return(
      <div>
        <h2>Insert a new Activity:</h2>
        <Activity ref="newActivity" />
        <button
          type="submit"
          onClick={this.handleSubmit.bind(this)}>Submit</button>
      </div>
    )
  }

}