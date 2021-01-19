import React from 'react';
import Swipe from 'react-easy-swipe';

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

class Wheel extends React.Component {
  constructor(props) {
    super(props);

    this.swipeRef = React.createRef();
    this.wheelPrizesRef = React.createRef();

    this.state = {
      activeSlide: null
    };
  }

  componentDidMount() {
    this.init();
  }

  init() {
    this.$Container = this.wheelPrizesRef.current;

    console.dir(Object.values(this.$Container.children));
    this.$slides = Object.values(this.$Container.children);

    this.rotateDirection = -1;
    this.rotationTimeLimit = getRandomInt(1500, 4000);

    this.slideAngle = 360 / this.$slides.length;
    this.currentRotationAngle = 0;
    this.autoRotateIntervalId = false;
    this.currentlyRotating = false;
    this.readyToDrag = false;
    this.currentlyDragging = false;

    this.setState({
      ...this.state,
      slideWidth: Math.min(256, window.innerWidth - 80),
      slideHeight: Math.min(308, window.innerWidth - 80),
      autoRotateInterval: 200,
      directionControls: false,
      rotationSpeed: 3000,
      /* Callback Functions */
      beforeRotationStart: function () {},
      afterRotationStart: function () {},
      beforeRotationEnd: function () {},
      afterRotationEnd: function () {}
    });
  }

  handlePlay() {
    this.rotateDirection < 0 ? this.startRotateRight() : this.startRotateLeft();

    setTimeout(() => {
      this.stopRotate();
    }, this.rotationTimeLimit);
  }

  handleDragStart(e) {
    this.readyToDrag = true;
    console.log(e);
    this.dragStartPoint = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
  }

  handleDragMove(position, evt) {
    console.log(position);
    console.log(evt);
    if (this.readyToDrag) {
      const pageX = evt.type === 'mousemove' ? evt.pageX : evt.touches[0].pageX;

      if (
        this.currentlyDragging === false &&
        this.currentlyRotating === false &&
        (this.dragStartPoint - pageX > 10 || this.dragStartPoint - pageX < -10)
      ) {
        this.rotateDirection = this.dragStartPoint - pageX > 10 ? 1 : -1;

        window.getSelection().removeAllRanges();
        this.currentlyDragging = true;
        this.dragStartAngle = this.currentRotationAngle;
      }
      if (this.currentlyDragging) {
        console.log(this.dragStartAngle);
        console.log(this.dragStartPoint);
        this.currentRotationAngle =
          this.dragStartAngle -
          ((this.dragStartPoint - pageX) / this.state.slideWidth) *
            this.slideAngle;

        this.setState({
          ...this.state,
          sliderContainerStyles: {
            ...this.state.sliderContainerStyles,
            transform: `translateX(-50%) rotate(${this.currentRotationAngle}deg)`
          }
        });
      }
    }
  }

  handleDragEnd() {
    this.readyToDrag = false;
    if (this.currentlyDragging) {
      this.currentlyDragging = false;
      this.currentRotationAngle =
        Math.round(this.currentRotationAngle / this.slideAngle) *
        this.slideAngle;

      // start play if drag move more than 1 slide
      if (Math.abs(this.currentRotationAngle) >= this.slideAngle) {
        this.handlePlay();
      } else {
        this.rotate();
      }
    }
  }

  rotateClockwise() {
    this.currentRotationAngle = this.currentRotationAngle + this.slideAngle;
    this.rotate();
  }

  rotateCounterClockwise() {
    this.currentRotationAngle = this.currentRotationAngle - this.slideAngle;
    this.rotate();
  }

  rotate() {
    this.beforeRotationStart();
    this.currentlyRotating = true;
    // this.$slider.addClass('currently-rotating');
    this.setState({
      ...this.state,
      sliderClass: 'currently-rotating'
    });

    if (this.rotateTimeoutId) {
      clearTimeout(this.rotateTimeoutId);
      this.rotateTimeoutId = false;
    }

    console.log(this.currentRotationAngle);
    this.setState({
      ...this.state,
      sliderContainerStyles: {
        ...this.state.sliderContainerStyles,
        transition: `transform ${this.state.rotationSpeed / 1000}s ease-out`,
        transform: `translateX(-50%) rotate(${this.currentRotationAngle}deg)`
      }
    });

    this.afterRotationStart();

    this.rotateTimeoutId = setTimeout(
      function () {
        this.beforeRotationEnd();
        this.currentlyRotating = false;
        // this.$slider.removeClass('currently-rotating');
        this.setState({
          ...this.state,
          sliderClass: '',
          sliderContainerStyles: {
            ...this.state.sliderContainerStyles,
            transform: `translateX(-50%) rotate(${this.currentRotationAngle}deg)`,
            transition: 'none'
          }
        });

        this.afterRotationEnd();
      }.bind(this),
      this.state.rotationSpeed
    );
  }

  setCurrentSlide() {
    const cyclesCount = Math.trunc(this.currentRotationAngle / 360);
    let currAngle = this.currentRotationAngle;
    if (this.currentRotationAngle >= 360 || this.currentRotationAngle <= -360) {
      currAngle >= 360
        ? (currAngle -= 360 * cyclesCount)
        : (currAngle += 360 * -cyclesCount);
    }

    const delta = this.$slides.length - currAngle / this.slideAngle;
    let activeSlide = delta !== this.$slides.length ? delta : 0;

    if (activeSlide > this.$slides.length) {
      activeSlide = delta - this.$slides.length * Math.abs(cyclesCount);
    }

    this.setState({
      ...this.state,
      activeSlide
    });
  }

  startRotateLeft() {
    this.autoRotateIntervalId = setInterval(
      function () {
        this.rotateCounterClockwise();
      }.bind(this),
      this.state.autoRotateInterval
    );
  }

  startRotateRight() {
    this.autoRotateIntervalId = setInterval(
      function () {
        this.rotateClockwise();
      }.bind(this),
      this.state.autoRotateInterval
    );
  }

  stopRotate() {
    if (this.autoRotateIntervalId) {
      clearInterval(this.autoRotateIntervalId);
      this.autoRotateIntervalId = false;
    }
  }

  /* Callbacks */
  beforeRotationStart() {
    // this.$slides.removeClass('active');
    this.state.beforeRotationStart();
  }

  afterRotationStart() {
    this.state.afterRotationStart();
  }

  beforeRotationEnd() {
    this.state.beforeRotationEnd();

    // this.currentRotationAngle = this.$currentSlide.index() * this.slideAngle * -1; // TODO fix for directions
  }

  afterRotationEnd() {
    this.state.afterRotationEnd();
    this.setCurrentSlide();
  }

  // onSwipeStart(event) {
  //   console.log('Start swiping...', event);
  // }

  onSwipeMove(position, event) {
    console.log(`Moved ${position.x} pixels horizontally`, event);
    console.log(`Moved ${position.y} pixels vertically`, event);
  }

  // onSwipeEnd(event) {
  //   console.log('End swiping...', event);
  // }

  items = [
    {
      title: 'Slide 1',
      text: 'content'
    },
    {
      title: 'Slide 2',
      text: 'content'
    },
    {
      title: 'Slide 3',
      text: 'content'
    },
    {
      title: 'Slide 4',
      text: 'content'
    },
    {
      title: 'Slide 5',
      text: 'content'
    },
    {
      title: 'Slide 6',
      text: 'content'
    },
    {
      title: 'Slide 7',
      text: 'content'
    },
    {
      title: 'Slide 8',
      text: 'content'
    },
    {
      title: 'Slide 9',
      text: 'content'
    },
    {
      title: 'Slide 10',
      text: 'content'
    },
    {
      title: 'Slide 11',
      text: 'content'
    },
    {
      title: 'Slide 12',
      text: 'content'
    }
  ];

  render() {
    const halfAngleRadian = ((this.slideAngle / 2) * Math.PI) / 180;
    const innerRadius =
      ((1 / Math.tan(halfAngleRadian)) * this.state.slideWidth) / 2;
    const outerRadius = Math.sqrt(
      Math.pow(innerRadius + this.state.slideHeight, 2) +
        Math.pow(this.state.slideWidth / 2, 2)
    );
    const upperArcHeight = outerRadius - (innerRadius + this.state.slideHeight);
    // const lowerArcHeight =
    //   innerRadius - innerRadius * Math.cos(halfAngleRadian);
    // const slideFullWidth = Math.sin(halfAngleRadian) * outerRadius * 2;
    // const slideFullHeight =
    //   upperArcHeight + this.state.slideHeight + lowerArcHeight;
    // const slideSidePadding = (slideFullWidth - this.state.slideWidth) / 2;
    // const fullArcHeight = outerRadius - outerRadius * Math.cos(halfAngleRadian);
    // const lowerArcOffset =
    //   (slideFullWidth - Math.sin(halfAngleRadian) * innerRadius * 2) / 2;

    /* Set height and width of slider element */
    const sliderStyles = {
      height: `${this.state.slideHeight}px`,
      width: `${this.state.slideWidth}px`
    };

    const sliderContainerStyles = {
      height: `${outerRadius * 2}px`,
      width: `${outerRadius * 2}px`,
      transform: 'translateX(-50%)',
      top: `${upperArcHeight}px`
    };

    return (
      <>
        <button onClick={this.handlePlay.bind(this)}>play</button>
        <Swipe
          innerRef={() => this.swipeRef}
          onSwipeStart={this.handleDragStart.bind(this)}
          onSwipeMove={this.handleDragMove.bind(this)}
          onSwipeEnd={this.handleDragEnd.bind(this)}
          allowMouseEvents
          className={this.state.activeSlide ? 'completed' : ''}
        >
          <div
            className={this.state.sliderClass}
            style={sliderStyles}
            id='wheel'
          >
            <div style={sliderContainerStyles} className='wheel-container'>
              <ul
                ref={this.wheelPrizesRef}
                style={this.state.sliderContainerStyles}
                className={`wheel-prizes ${
                  this.state.activeSlide ? 'completed' : ''
                }`}
              >
                {this.items.map((item, idx) => {
                  const styles = {
                    transformOrigin: `center ${
                      innerRadius + this.state.slideHeight
                    }px`,
                    height: `${this.state.slideHeight}px`,
                    width: `${this.state.slideWidth}px`,
                    // padding: `${upperArcHeight}px ${slideSidePadding}px ${lowerArcHeight}px`,
                    top: `${upperArcHeight}px`,
                    transform: `translateX(-50%) rotate(${
                      this.slideAngle * idx
                    }deg) translateY(-${upperArcHeight}px)`
                  };

                  return (
                    <li
                      key={`slide-${idx}`}
                      style={styles}
                      className={this.state.activeSlide === idx ? 'active' : ''}
                    >
                      <div className='inner'>
                        <h2>{item.title}</h2>
                        <p>{item.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Swipe>
      </>
    );
  }
}

export default Wheel;
