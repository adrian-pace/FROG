import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';

const divStyleNeg = {
  background: "white",
  top: 30,
  width: 60,
  height: 10,
  margin: 10,
  padding: 10,
  zIndex: 0,
  position: "absolute"


}

const divStyle = {
  background: "white",
  border: 2,
  width: 60,
  height: 40,
  margin: 10,
  padding: 10,
  float: "left",
  position: "relative",
  borderStyle: "solid",
  borderColor: "green"

}
const unitTime = 2

const startOffset = 0

const computeTopPosition = (object) => {
  let inner = $("#inner_graph").offset().top
  let elem = $(object).offset().top
  return elem - inner
}

export default class DraggableAc extends Component {

  constructor(props) {
    super(props)

    this.state = {
      correctPlace: false,
      deltaPosition: {x: 0, y: 0},
      controlledPosition: {x: 0, y:0},
      hover: false
    }
  }

  componentDidMount () {
    if(this.props.editorMode) {
      this.setState({deltaPosition: {x: this.props.defaultPosition.x, y:0, controlledPosition: this.defaultPosition()}})
    }
  }

  AcDivStyle(style) {
    return {
      background: style.background,
      textAlign:"center",
      border: style.border,
      width: this.props.duration * unitTime,
      height: 40,
      margin: style.margin,
      padding: style.padding,
      float: style.float,
      position: "absolute",
      borderStyle: style.borderStyle,
      borderColor: style.borderColor,
      zIndex: 1

    }
  }

  getY() {
    return computeTopPosition("#plane" + this.props.plane)
  }
  getX() {
    return this.props.startTime  * unitTime + startOffset;
  }

  defaultPosition = () => {
    var { defaultPosition, editorMode } = this.props;
    return {
      x: editorMode ? defaultPosition.x : this.getX(),
      y: editorMode ? defaultPosition.y : this.getY()
    }
  }

  handleStart = (event) => {

  }

  handleDrag = (event, ui) => {
    event.preventDefault();
    var {x, y} = this.state.deltaPosition;

    this.setState({
      deltaPosition: {
        x: x + ui.deltaX,
        y: y + ui.deltaY,
      }
    });

  }

  handleStop = (event) => {
    event.preventDefault();
    var delta = this.state.deltaPosition;

    var position = this.checkLayout(delta, event);
    this.props.handleMove(this.props.arrayIndex, position.newControlledPostition)

    this.setState({
      deltaPosition: position.newDelta,
      correctPlace: position.newPlace,
      controlledPosition: position.newControlledPostition
    });
  }

  checkLayout = (delta, event) => {
    var newPlace = (delta.y <= 170); //corresponding to height of parent's svg
    var newDelta = {x: delta.x, y: this.getY()};
    var newY = this.defaultPosition().y;

    if(!newPlace) {

      newDelta = {x: 0, y: 0};
      newY = 0;

      this.props.delete(this.props.activity)
    }
    var newControlledPostition = {x: delta.x, y:newY};

    return {
      newPlace: newPlace,
      newDelta: newDelta,
      newControlledPostition: newControlledPostition
    };
  }

  positionAndReset = () => {
    return this.state.correctPlace ?
      this.state.controlledPosition
      : this.defaultPosition(this.props.editorMode);
  }

  render() {
    return(
      <Draggable
        axis='x'
        id = {'drag_' + this.props.activity._id}
        defaultPosition={this.defaultPosition()}
        position={this.positionAndReset()}

        disabled={!this.props.editorMode}

        onStart={this.handleStart}
        onDrag={this.handleDrag}
        onStop={this.handleStop}
        grid={[30, 20]}
        cancel="svg">
        <div  style={{position: 'relative', zIndex: 1}}>
          <div id = {this.props.activity._id}  style={this.AcDivStyle(divStyle)}>
            <svg height="10" width="10" style={{position: "relative"}} onClick={(event) => this.props.targetOperator(this.props.activity)}>
              <circle cx="5" cy="5" r="5" stroke="black" fill="white" id={"target" + this.props.activity._id}/>
            </svg>
            <span>  Plane {this.props.plane}  </span>
            <svg height="10" width="10" style={{position: "relative"}} onClick={(event) => this.props.sourceOperator(this.props.activity)}>
              <circle cx="5" cy="5" r="5" stroke="black" fill={this.props.isSourceClicked ? "red" : "white"} id={"source" + this.props.activity._id} />
            </svg>
          </div>
        </div>
        </Draggable>

    );

  }
}

DraggableAc.propTypes = {
  activity: PropTypes.object.isRequired,
  editorMode: PropTypes.bool.isRequired,
  plane: PropTypes.number.isRequired,
  startTime: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  defaultPosition: PropTypes.object.isRequired,
  handleMove: PropTypes.func.isRequired,
  arrayIndex: PropTypes.number.isRequired,
  delete: PropTypes.func,
  sourceOperator: PropTypes.func,
  targetOperator: PropTypes.func,
  isSourceClicked: PropTypes.bool,
};
