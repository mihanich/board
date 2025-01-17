import React, { Component } from 'react';
import { API_URL } from '../../../helper/Config';

import './Login.css';

class Login extends Component {
  state = {
    login: '',
    password: '',
    error: ''
  }

  handleSubmit = (event) => {
    event.preventDefault();

    fetch(API_URL + 'config/auth').then(response => response.json())
    .then(data => {
        if (data.login === this.state.login && data.password === this.state.password) {
            sessionStorage.setItem('auth', true);
            window.location.reload();
        } else {
            this.setState({error: 'Login Failed'});
            sessionStorage.clear();
        }
    });
  }

  handleLoginChange = (event) => {
    this.setState({ login: event.target.value})
  }

  handlePasswordChange = (event) => {
    this.setState({ password: event.target.value})
  }

  render() {    
    return (
      <div className="form-signin-wrapper">
        <form className="form-signin">
            <h1 className="h3 mb-3 font-weight-normal">Please sign in</h1>
            <p className="auth-error">{this.state.error}</p>
            <input type="text" className="form-control" value={this.state.login} placeholder="Login" onChange={this.handleLoginChange} required autoFocus />
            <input type="password"  className="form-control" placeholder="Password" onChange={this.handlePasswordChange} value={this.state.password} required />
            <button className="btn btn-lg btn-primary btn-block" type="submit" onClick={this.handleSubmit}>Sign in</button>
        </form>
    </div>
    );
  };
};

export default Login;
