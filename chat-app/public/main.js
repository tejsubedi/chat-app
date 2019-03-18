   var app = angular.module('myApp', []);
   app.controller('myCtrl', function($scope) {

       $scope.logInSection = true;
       $scope.chatSection = false;
       $scope.chatSectionLeftRoom = false;
       $scope.chatSectionLeft = false;
       $scope.login = {
           email: '',
           nickName: ''
       }
       $scope.roomList = [];
       $scope.chatMessage = [];
       $scope.privatechatMessage = [];
       $scope.message = '';

       /* socket */
       var socket = io();

       /* Event */
       $scope.onLoginClick = () => {
           socket.emit('register user', $scope.login);
           $scope.logInSection = false;
           $scope.chatSection = true;
           $scope.chatSectionLeft = true;
       }

       $scope.onClickSend = () => {
           if ($scope.message != '') {
               socket.emit('sendmessage', { 'user': $scope.login.email, 'nick': $scope.login.nickName, 'message': $scope.message, 'room': $scope.roomName });
               $scope.message = '';
           }
       }

       $scope.onClickRoom = (room) => {
           const roomName = room.name;
           if (confirm('Do you want to Join ' + roomName)) {
               socket.emit('joinroom', roomName);
           }
       }

       socket.on('register user', (username, usernick, roomlist, chatmessage) => {
           $scope.$apply(function() {
               $scope.roomList = roomlist;
               $scope.chatMessage.push({ 'user': username, 'nick': usernick, 'message': 'Joined' });
           });
       });

       socket.on('sendmessage', (v) => {
           $scope.$apply(function() {
               $scope.chatMessage.push(v);
           });
       });

       socket.on('joinroom', (username, roomname) => {
           $scope.$apply(function() {
               $scope.chatSectionLeft = false;
               $scope.chatSectionLeftRoom = true;
               $scope.privatechatMessage.push({ 'user': username, 'message': ' Joined ' + roomname });
           });
       });

       socket.on('sendmessagetoroom', (v) => {
           $scope.$apply(function() {
               $scope.privatechatMessage.push(v);
           });
       })

       socket.on('disconnect', (v) => {
           $scope.chatMessage.push({ 'user': v, 'message': ' Leaves' });
       });
   });