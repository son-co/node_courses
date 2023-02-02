var session = require('express-session');
const mongoose = require("mongoose");
const { db } = require('../models/course.model');

const course = require('../models/course.model');
const lession = require('../models/lession.model');
const userModel = require('../models/user.model');
const courseSub = require('../models/courseSub.model');
const thongkeModel = require("../models/thongke.model");
const commentModel = require('../models/comment.model');

module.exports = {
    //Hiển thị giao diện cho học viên 
    showData: async(request, response) => {
        if (request.session.login) {
            course.find({}, function(err, data) {
                if (data) {
                    response.render('index', {
                        dataCustomer: {
                            id: request.session ? request.session.ma : false,
                            name: request.session.hoten,
                        },
                        course: data,
                    });
                }
            })
        } else {
            if (request.session) {
                // delete session object
                course.find({}, function(err, data) {
                    if (data) {
                        response.render('index', {
                            dataCustomer: {
                                id: request.session ? request.session.ma : false,
                                // name: request.session.hoten,
                            },
                            course: data,
                        });
                    }
                })

            }
        }
    },
    //Hiển thị chi tiết thông tin khóa học
    showDetailCourse: async(req, res) => {
        if (req.session.login) {
            course.findOne({ _id: req.params._id }, function(err, data) {
                commentModel.find({}, function(err, cmt) {
                    var m = [];
                    if (data || cmt) {
                        var arr = cmt.filter(a => {
                            var arr1 = new Array(a);
                            return arr1;

                        })
                        j = 0;
                        for (var i = 0; i < arr.length; i++) {
                            if (arr[i].courseID == String(req.params._id)) {
                                m[j] = arr[i];
                                j++;

                            }
                        }
                        // console.log("arr", m)
                        res.render('CourseDetail', {
                            dataCustomer: {
                                id: req.session ? req.session.ma : false,
                                name: req.session.hoten,
                            },
                            course: data,
                            commentt: m
                        });
                    }
                })
            })
        } else {
            res.redirect('/login');
        }
    },
    //Hiển thị các bài học có trong khóa học
    showlession: async(req, res) => {
        if (req.session.login) {
            course.findOne({ _id: req.params._id }, function(err, data) {
                lession.find({ courseID: data._id }, function(err, less) {
                    if (data || less) {
                        db.collection('coursesubs').insertOne({
                            courseID: req.params._id,
                            userID: req.session.ma,
                            userName: req.session.hoten,
                            imageID: data.imageID,
                            courseName: data.name
                        })
                        course.updateMany({ _id: req.params._id }, { $set: { subscribe: parseInt(data.subscribe) + 1 } },
                            function(err, result) {
                                if (result) {
                                    console.log('Updated');
                                }
                            }
                        )

                        res.render('lessionlist', {
                            dataCustomer: {
                                id: req.session ? req.session.ma : false,
                                name: req.session.hoten,
                            },
                            lession: less,
                            course: data
                        });

                    }

                })
            })
        } else {
            res.redirect('/login');
        }
    },
    //Đăng xuất khỏi tài khoản học viên 
    logOut: function(request, response) {
        if (request.session.role == "user") {
            // delete session object
            request.session.ma = false;
            course.find({}, function(err, data) {
                if (data) {
                    thongkeModel.findOne({ _id: '62724d472e1dc5134584f0c9' }, function(err, tk) {
                        if (tk) {
                            thongkeModel.updateMany({ _id: '62724d472e1dc5134584f0c9' }, {
                                    $set: {
                                        login: tk.login - 1,
                                    }
                                },
                                function(err, result) {
                                    if (result) {
                                        console.log('Updated');
                                    }
                                }
                            )
                        }
                    })
                    response.render('index', {
                        dataCustomer: {
                            id: request.session ? request.session.ma : false,
                            // name: request.session.hoten,
                        },
                        course: data,
                    })



                }
            })

        } else {
            request.redirect('/admin')
        }
    },
    //Tìm kiếm bài học
    searchCourse: function(req, res) {

        var key_search = req.query.search;
        // userModel.findOne({}, function(err, users) {
        lession.find({}, function(err, pro) {
            if (pro) {
                var pros = [];
                pros = pro;
            }
            var result = pros.filter((user) => {
                return user.name.toLowerCase().indexOf(key_search.toLowerCase()) !== -1;
            })

            res.render('search', {
                dataCustomer: {
                    id: req.session ? req.session.ma : false,
                    name: req.session.hoten,
                },
                course: result
            })
        })

    },

    //HIển thị các khóa học học viên đã xem
    mycourse: async(request, response) => {
        if (request.session.login) {
            courseSub.find({}, function(err, cs) {
                var m = [];
                var n = [];
                if (cs) {
                    var arr = cs.filter(a => {
                        var arr1 = new Array(a);
                        return arr1;

                    })
                    j = 0;
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i].userID == String(request.session.ma)) {
                            m[j] = arr[i];
                            j++;
                        }
                    }

                    for (var i = 0; i < m.length - 1; i++) {
                        for (var j = i + 1; j < m.length; j++) {
                            if (String(m[j].courseID) == String(m[i].courseID)) {
                                for (var k = i; k < m.length; k++) {
                                    m[k] = m[k + 1];
                                }
                                m.length--;
                                j--;
                            }
                        }

                    }
                    response.render('mycourse', {
                        dataCustomer: {
                            id: request.session ? request.session.ma : false,
                            name: request.session.hoten,
                        },
                        coursesub: m,
                    });
                }
            })
        } else {
            response.redirect('/login');
        }
    },
    //Thêm comment vào mỗi khóa học
    addCmt: function(request, res) {

        var today = new Date();
        var date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();

        db.collection('comments').insertOne({
            userID: request.session.ma,
            courseID: request.body._id,
            userName: request.session.hoten,
            content: request.body.commentData,
            date: date
        })

        res.json({ stt: true });

    },

}