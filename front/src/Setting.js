import React, { Component } from 'react';
import Row from './components/setting/row/Row.js';
import Col from './components/setting/col/Col.js';
import Login from './components/setting/login/Login.js';
import { API_URL } from './helper/Config';

import './App.css';

class Setting extends Component {
  state = {
    rows: [
      {
        row_number: 1,
        cols: [
          {width: 4},
          {width: 4},
          {width: 4}
        ]
      },
      {
        row_number: 2,
        cols: [
          {width: 4},
          {width: 4},
          {width: 4}
        ]
      },
      {
        row_number: 3,
        cols: [
          {width: 4},
          {width: 4},
          {width: 4}
        ]
      },
    ],
    selected_col: {},
    selected_row: null,
    startGenerating: false,
    valueRow: 1,
    valueColumn: 1,
    modalHeight: [],
    tempHeight: 0,
    previewModalState: false,
    timerModalState: false,
    timerStart: 9,
    timerEnd: 23,
    token: sessionStorage.getItem('auth'),
    images: []
  }

  componentDidMount() {
    this.getConfig();
    this.fetchAllImages();
  }

  fetchAllImages() {
		fetch(API_URL + 'images').then(response => response.json())
		.then(data => {
			this.setState({images : data.data});
		});
	}

  getConfig = () => {
		fetch(API_URL + 'config').then(response => response.json())
		.then(data => {
      if (data.length) {
        this.setState({
          startGenerating: true,
        })
        this.generateGridByConfig(data);
      }
		});
	}

  generateGridByConfig = (config) => {
    const rows = [{
      row_number: 0,
      cols: []
    }];

    let counter = 0,
      widthCounter = 0;

    config.forEach(row => {

      if ((row.width + widthCounter) > 100) {
        counter = counter + 1;
        widthCounter = row.width;

        rows[counter] = {
          row_number: counter,
          height: row.height
        };

        if (row.type === 'video') {
          rows[counter].cols = [
            {width: (row.width / 100) * 12, type: row.type, value: row.startPosition}
          ];
        } else if (row.type === 'frame') {
          rows[counter].cols = [
            {width: (row.width / 100) * 12, type: row.type, value: row.url}
          ];
        } else if (row.type === 'slider') {
          rows[counter].cols = [
            {width: (row.width / 100) * 12, type: row.type, value: row.startPosition, images: row.images, delay: row.delay}
          ];
        }
        
      } else {
        widthCounter += row.width;

        rows[counter].height = row.height;

        if (row.type === 'video') {
          rows[counter].cols.push({width: (row.width / 100) * 12, type: row.type, value: row.startPosition});
        } else if (row.type === 'frame') {
          rows[counter].cols.push({width: (row.width / 100) * 12, type: row.type, value: row.url});
        } else if (row.type === 'slider') {
          rows[counter].cols.push({width: (row.width / 100) * 12, type: row.type, value: row.startPosition, images: row.images, delay: row.delay});
        }
      }
    })

    this.setState({
      rows: rows
    })
  }

  addRemoveLastRow = option => {
    if (option === 'add') {
      if (!this.state.rows.length) {
        return this.setState({
          rows: this.state.rows.concat({row_number: 1, cols: [], height: 20})
        })
      }
      this.setState({
        rows: this.state.rows.concat({row_number: this.state.rows[this.state.rows.length - 1].row_number + 1, height: 25, cols: []})
      })
    } else if (option === 'remove' && this.state.rows.length > 0) {
      this.setState({
        rows: this.state.rows.slice(0, this.state.rows.length - 1),
        selected_col: {}
      })
    };
  };

  addNewRow = index => {
    const firstHalf = this.state.rows.slice(0, index + 1)
    const secondHalf = this.state.rows.slice(index + 1, this.state.rows.length)
    
    const rows = [...firstHalf, {row_number: index, cols: []}, ...secondHalf]
    .map((row, i) => {
      row.row_number = i + 1
      return row
    })

    this.setState({
      rows,
      selected_row: null
    });
  }

  changeHeight = id => {
    const modalHeight = this.state.modalHeight;

    modalHeight[id - 1] = true;

    this.setState({
      modalHeight
    })
  }

  selectColumn = col => {
    this.setState({
      selected_col: col,
      selected_row: col.row
    });
  };

  selectRow = row => {
    this.setState({
      selected_row: row
    });
  };

  addOneColumn = (row_num) => {
    const rows = this.state.rows.map(row => {
      if (row.row_number === row_num) {
        row.cols.push({width: 4, type: 'video', value: 1})
        return row
      } else {
        return row
      }
    })

    this.setState({
      rows
    })
  }

  deleteSelectedRow = row_number => {
    const rows = this.state.rows.filter(row => {
      return row.row_number !== row_number
    }).map((row, i) => {
      row.row_number = i + 1
      return row
    });

    this.setState({
      rows,
      selected_row: null,
      selected_col: {}
    })
  }

  moveArrItems = (arr, old_index, new_index) => {
    while (old_index < 0) {
      old_index += arr.length;
    }
    while (new_index < 0) {
        new_index += arr.length;
    }
    if (new_index >= arr.length) {
        let k = new_index - arr.length;
        while ((k--) + 1) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);  
    return arr;
  }

  moveRowUpDown = (option, index) => {
    if (option === 'up' && index !== 0) {
      const rows = this.moveArrItems(this.state.rows, index, index - 1)
      .map((row, i) => {
        row.row_number = i + 1
        return row
      });
      return this.setState({
        rows,
        selected_col: {},
        selected_row: null
      });
    } else if (option === 'down' && index !== this.state.rows.length -1){
      const rows = this.moveArrItems(this.state.rows, index, index + 1)
      .map((row, i) => {
        row.row_number = i + 1
        return row
      });
      return this.setState({
        rows,
        selected_col: {},
        selected_row: null
      });
    };
  };

  deleteSelectedColumn = (colId, colRow) => {
    const rows = this.state.rows.map(row => {
      if (row.row_number === colRow) {
        row.cols = row.cols.filter((col, i) => {
          return colId !== i
        })
        return row;
      } else {
        return row;
      }
    });

    this.setState({
      rows,
      selected_col: {}
    });
  };

  updateInputState = (row_number, index, value) => {
    const rows = this.state.rows.map((row, id) => {
      if (row.row_number === row_number) {
        const newCol = row.cols.map((col, i) => {
          if (index === i) {
            col.value = value;
            return col
          } else {
            return col
          }
        })
        row.cols = newCol
        return row;
      } else {
        return row;
      }
    })

    this.setState({
      rows
    })
  }

  updateInputDelayState = (row_number, index, value) => {
    const rows = this.state.rows.map((row, id) => {
      if (row.row_number === row_number) {
        const newCol = row.cols.map((col, i) => {
          if (index === i) {
            col.delay = value;
            return col
          } else {
            return col
          }
        })
        row.cols = newCol
        return row;
      } else {
        return row;
      }
    })

    this.setState({
      rows
    })
  }

  updateSelectState = (row_number, index, value) => {
    const rows = this.state.rows.map((row, id) => {
      if (row.row_number === row_number) {
        const newCol = row.cols.map((col, i) => {
          if (index === i) {
            col.type = value;
            return col
          } else {
            return col
          }
        })
        row.cols = newCol
        return row;
      } else {
        return row;
      }
    })

    this.setState({
      rows
    })
  }

  updateSelectImageState = (row_number, index, value) => {
    const rows = this.state.rows.map((row, id) => {
      if (row.row_number === row_number) {
        const newCol = row.cols.map((col, i) => {
          if (index === i) {
            col.images = value;
            return col
          } else {
            return col
          }
        })
        row.cols = newCol
        return row;
      } else {
        return row;
      }
    })

    this.setState({
      rows
    })
  }

  changeColumnWidth = (row_number, index, width) => {
    const rows = this.state.rows.map((row, id) => {
      if (row.row_number === row_number) {
        const newCol = row.cols.map((col, i) => {
          if (index === i) {
            col.width = width;
            return col
          } else {
            return col
          }
        })
        row.cols = newCol
        return row;
      } else {
        return row;
      }
    })

    this.setState({
      rows
    })
  };

  changeSize = size => {
    this.setState({
      size
    })
  };

  onDrag = (e, row, id) => {
    e.dataTransfer.setData('col', JSON.stringify({row, id}));
    e.target.classList.add('col-drag-item');
  };

  drop = (e, row, id) => {
    e.stopPropagation();

    const data = JSON.parse(e.dataTransfer.getData('col'));
    const movingCol = this.state.rows[data.row - 1].cols[data.id];

    document.querySelectorAll('.col-drag-item').forEach(el => el.classList.remove('col-drag-item'));

    if (data.row === row) {
      const rows = this.state.rows.map(stateRow => {
        if (stateRow.row_number === row) {
          stateRow.cols = this.moveArrItems(stateRow.cols, data.id, id);
          return stateRow;
        } else {
          return stateRow;
        }
      });

      this.setState({
        rows
      });
    } else if (id === undefined) {
      const rows = this.state.rows.map(stateRow => {
        if (stateRow.row_number === row) {
          stateRow.cols.push(movingCol);
          return stateRow;
        } else if (stateRow.row_number === data.row) {
          stateRow.cols = stateRow.cols.filter((col, i) => {
            return i !== data.id ? col : null
          });
          return stateRow;
        } else {
          return stateRow;
        } 
      });

      this.setState({
        rows
      });
    } else if (data.row !== row) {
      const rows = this.state.rows.map((stateRow, i) => {
        if (stateRow.row_number === data.row) {
          stateRow.cols = stateRow.cols.filter((col, i) => {
            return i !== data.id ? col : null
          });
          return stateRow;
        } else if (i === row - 1) {
          stateRow.cols = [...stateRow.cols.slice(0, id), movingCol, ...stateRow.cols.slice(id)];
          return stateRow;
        } else {
          return stateRow;
        }
      });

      this.setState({
        rows
      });
    }
  };

  handleChangeRow = (event) => {
    this.setState({valueRow: Number(event.target.value)});
  }

  handleChangeColumn = (event) => {
    this.setState({valueColumn: Number(event.target.value)});
  }

  handleChangeStart = (event) => {
    this.setState({timerStart: Number(event.target.value)});
  }

  handleChangeEnd = (event) => {
    this.setState({timerEnd: Number(event.target.value)});
  }

  handleSubmit = (event) => {
    event.preventDefault();

    let rows = [];

    for (let i = 0; i < this.state.valueRow; i++) {
      rows.push({
        row_number: i + 1,
        height: 100 / this.state.valueRow,
        cols: [],
      });

      for (let j = 0; j < this.state.valueColumn; j++) {
        rows[i].cols.push({width: 12 / this.state.valueColumn, type: 'video', value: 1});
      }
    }

    this.setState({
      rows,
      startGenerating: true
    });
  }

  handleSaveConfig = async (event) => {
    event.preventDefault();

    const rows = [];

    this.state.rows.forEach(row => {
      row.cols.forEach(col => {
        const colParams = {};

        colParams.type = col.type;
        colParams.height = Math.round(row.height);
        colParams.width = Math.round((col.width * 100) / 12);

        if (col.type === 'video') {
          colParams.startPosition = Number(col.value);
        } else if (col.type === 'frame') {
          colParams.url = col.value;
        } else if (col.type === 'slider') {
          colParams.images = col.images;
          colParams.delay = col.delay;
          colParams.startPosition = Number(col.value);
        }

        rows.push(colParams);
      })
    });

    this.setState({
      previewModalState: !this.state.previewModalState
    });

    await this.postData(API_URL + 'config', rows);
  }

  postData = async (url = '', data = []) => {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(data)
    });

    return await response.json();
  }

  handleHeight = (event, id) => {
    event.preventDefault();

    if (this.state.tempHeight) {
      const rows = this.state.rows;

      rows[id].height = this.state.tempHeight;

      this.setState({
        rows
      })
    }

    const modalHeight = this.state.modalHeight;

    modalHeight[id] = false;

    this.setState({
      modalHeight,
      tempHeight: 0
    })
  }

  handleChangeHeight = event => {
    this.setState({
      tempHeight: Number(event.target.value)
    })
  }

  generateHeightModal = (id) => {
    return (
      <div className="modal show" id="exampleModal" tabIndex="-1" role="dialog" aria-hidden="true" key={id}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Set height</h5>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label htmlFor="recipient-name" className="col-form-label">Height:</label>
                  <input type="number" className="form-control" step="5" placeholder={this.state.rows[id].height + "%"} onChange={this.handleChangeHeight}/>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={(event) => { this.handleHeight(event, id)}}>Change</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  handleLogout = (event) => {
    event.preventDefault();

    sessionStorage.clear();
    window.location.reload();
  }

  generateGridModal = () => {
    return (
      <div className="modal show" id="exampleModal" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Set started setting</h5>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label htmlFor="recipient-name" className="col-form-label">Row counter:</label>
                  <input type="number" className="form-control" value={this.state.valueRow} onChange={this.handleChangeRow} />
                </div>
                <div className="form-group">
                  <label htmlFor="recipient-name" className="col-form-label">Column counter:</label>
                  <input type="number" className="form-control" value={this.state.valueColumn} onChange={this.handleChangeColumn}/>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={this.handleLogout}>Logout</button>
              <button className="btn btn-primary" onClick={this.handleSubmit}>Generate</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  createLayout = () => {
    const grid = []
    this.state.rows.forEach((row, i) => {
      grid.push(
        <>
        <Row 
          select_row={this.selectRow} 
          key={i} 
          index={i}
          id={i + 1}
          moveRowUpDown={this.moveRowUpDown}
          addNewRow={this.addNewRow}
          addOneColumn={this.addOneColumn}
          deleteSelectedRow={this.deleteSelectedRow}
          drop={this.drop}
          changeHeight={this.changeHeight}
          generateHeightModal={this.generateHeightModal}
          modalHeight={this.state.modalHeight}
          row={row}
        >

          {
            row.cols.map((col, i) => {
              return <Col
                        select_column={this.selectColumn}
                        key={`${i}-${row.row_number}`}
                        id={i}
                        row={row.row_number}
                        config={col}
                        type={col.type}
                        inputValue={col.value}
                        changeColumnWidth={this.changeColumnWidth}
                        updateSelectState={this.updateSelectState}
                        updateInputState={this.updateInputState}
                        updateSelectImageState={this.updateSelectImageState}
                        updateInputDelayState={this.updateInputDelayState}
                        deleteSelectedColumn={this.deleteSelectedColumn}
                        onDrag={this.onDrag}
                        drop={this.drop}
                        images={this.state.images}
                      />
            })
          }
        </Row>
        </>
      )
    });

    return grid;
  };

  previewModal = () => {
    const rowsTemplate = this.state.rows.map(row => {
      return (
        <div className="row previewRow" data-row-height={row.height}>
          {row.cols.map(col => {
            return (
              <div className={'col-'+ col.width + ' previewCol'}></div>
            )
          })}
        </div>
      );
    })

    return (
      <div className="modal show" id="exampleModal" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Preview</h5>
            </div>
            <div className="modal-body m-preview">
              {rowsTemplate}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={this.handleSaveConfig}>Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  handleSaveTimer = async (event) => {
    event.preventDefault();

    const timer = {
      "startTime": this.state.timerStart,
      "offTime": this.state.timerEnd
    };

    this.setState({
      timerModalState: !this.state.timerModalState
    });

    await this.postData(API_URL + 'config/timer', timer);
  }

  timerModal = () => {
    return (
      <div className="modal show" id="exampleModal" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">New timer</h5>
            </div>
            <div className="modal-body m-preview">
            <form>
                <div className="form-group">
                  <label htmlFor="recipient-name" className="col-form-label">Start:</label>
                  <input type="number" className="form-control" value={this.state.timerStart} onChange={this.handleChangeStart} />
                </div>
                <div className="form-group">
                  <label htmlFor="recipient-name" className="col-form-label">End:</label>
                  <input type="number" className="form-control" value={this.state.timerEnd} onChange={this.handleChangeEnd}/>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={this.handleSaveTimer}>Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  previewModalToggle = () => {
    this.setState({
      previewModalState: !this.state.previewModalState
    })
  }

  timerModalToggle = () => {
    this.setState({
      timerModalState: !this.state.timerModalState
    })
  }

  render() {

    if (!this.state.token) {
      return <Login setToken={this.setToken} />
    }
    
    return (
      <div className="app" key="setting">
        <div className={`grid`}>
          {this.state.startGenerating ? this.createLayout() : this.generateGridModal()}
          <div
            className="row add-row"
            onClick={() => this.addRemoveLastRow('add')}
          ></div>
        </div>
        <div>
            <span
              title="Save changes"
              onClick={this.previewModalToggle}
              className="glyphicon glyphicon-floppy-disk save-button"
            ></span>
            <span title="Edit timer"
              className="glyphicon glyphicon-wrench timer-button"
              onClick={this.timerModalToggle}
              ></span>
        </div>
        {this.state.previewModalState ? this.previewModal() : null}
        {this.state.timerModalState ? this.timerModal() : null}
      </div>
    );
  };
};

export default Setting;
