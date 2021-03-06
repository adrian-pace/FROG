// @flow

import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { withState } from 'recompose';
import { Nav, NavItem } from 'react-bootstrap';
import styled from 'styled-components';

import { Activities } from '../../api/activities';
import { activityTypesObj } from '../../activityTypes';
import { connection } from '../App/index';

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

class Dashboard extends Component {
  state: { data: any };
  doc: any;
  timeout: ?number;
  unmounted: boolean;

  constructor(props: Object) {
    super(props);
    this.state = { data: null };
    this.init(props);
  }

  componentWillReceiveProps(nextProps: Object) {
    if (this.props.activity._id !== nextProps.activity._id || !this.doc) {
      if (this.doc) {
        this.doc.destroy();
      }
      this.init(nextProps);
    }
  }

  init(props: Object) {
    this.doc = connection.get('rz', props.activity._id + '//DASHBOARD');
    this.doc.subscribe();
    this.doc.on('ready', this.update);
    this.doc.on('op', this.update);
    this.waitForDoc();
  }

  waitForDoc = () => {
    if (this.doc.type) {
      this.timeout = undefined;
      this.update();
    } else {
      this.timeout = window.setTimeout(this.waitForDoc, 100);
    }
  };

  update = () => {
    if (!this.timeout && !this.unmounted) {
      this.setState({ data: this.doc.data });
    }
  };

  componentWillUnmount = () => {
    if (this.doc) {
      this.doc.destroy();
    }
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }
    this.unmounted = true;
  };

  render() {
    const aT = activityTypesObj[this.props.activity.activityType];
    return aT.dashboard && aT.dashboard.Viewer
      ? <aT.dashboard.Viewer data={this.state.data} />
      : <p>The selected activity does not provide a dashboard</p>;
  }
}

const DashboardNav = ({ activityId, setActivity, openActivities }) => {
  const aId =
    activityId || (openActivities.length > 0 && openActivities[0]._id);
  if (!aId) {
    return null;
  }
  return (
    <div>
      <h1>Dashboards</h1>
      <Container>
        <Nav
          bsStyle="pills"
          stacked
          activeKey={aId}
          onSelect={a => setActivity(a)}
          style={{ width: '150px' }}
        >
          {openActivities.map(a =>
            <NavItem eventKey={a._id} key={a._id} href="#">
              {a.title}
            </NavItem>
          )}
        </Nav>
        <Dashboard activity={openActivities.find(a => a._id === aId)} />
      </Container>
    </div>
  );
};

export default createContainer(
  ({ openActivities }) => ({
    openActivities: Activities.find({ _id: { $in: openActivities } }).fetch()
  }),
  withState('activityId', 'setActivity', null)(DashboardNav)
);
