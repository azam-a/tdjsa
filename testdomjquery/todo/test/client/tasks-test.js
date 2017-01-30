describe('tasks-with builtin functions-tests', function() {
    it('should pass this canary test', function() {
        expect(true).to.be.true;
    });

    var sandbox;
    var domElements;
    var responseStub;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();

        domElements = {};

        sandbox.stub(document, 'getElementById', function(id) {
            if(!domElements[id]) {
                domElements[id] = {};
            }
            return domElements[id];
        });

        responseStub = JSON.stringify([
            {_id: '123412341201', name: 'task a', month: 8, day: 1, year: 2016},
            {_id: '123412341202', name: 'task b', month: 9, day: 10, year: 2016},
            {_id: '123412341203', name: 'task c', month: 10, day: 11, year: 2017},
        ]);

        xhr = sinon.useFakeXMLHttpRequest();
        xhr.requests = [];
        xhr.onCreate = function(req) { xhr.requests.push(req) };
    });

    afterEach(function() {
        sandbox.restore();
        xhr.restore();
    });

    it('getTasks should call callService', function(done) {
        sandbox.stub(window, 'callService',
            function(params) {
                expect(params.method).to.be.eql('GET');
                expect(params.url).to.be.eql('/tasks');
                done();
            });

        getTasks();
    });

    it('getTasks should register updateTasks with callService', function() {
        var callServiceMock = sandbox.mock(window)
            .expects('callService')
            .withArgs(sinon.match.any, updateTasks);

        getTasks();
        callServiceMock.verify();
    });

    it('updateTasks should update message if status!=200', function() {
        updateTasks(404, '..err..');

        expect(domElements.message.innerHTML).to.be.eql('..err.. (status: 404)');
    });

    it('updateTasks should update taskcount', function() {
        updateTasks(200, responseStub);

        expect(domElements.taskscount.innerHTML).to.be.eql(3);
    });

    it('updateTasks should update tasks table', function() {
        updateTasks(200, responseStub);
    
        expect(domElements.tasks.innerHTML).contains('<table>');
        expect(domElements.tasks.innerHTML).contains('<td>task a</td>');
        expect(domElements.tasks.innerHTML).contains('<td>8/1/2016</td>');
        expect(domElements.tasks.innerHTML).contains('<td>task b</td>');
    });

    it('callService should make call to service', function() {
        callService({method: 'GET', url: '/tasks'}, sandbox.spy());

        expect(xhr.requests[0].method).to.be.eql('GET');
        expect(xhr.requests[0].url).to.be.eql('/tasks');
        expect(xhr.requests[0].sendFlag).to.be.true;
    });

    it('callService should send xhr status code to callback', function() {
        var callback = sandbox.mock().withArgs(200).atLeast(1);

        callService({method: 'GET', url: '/tasks'}, callback);
        xhr.requests[0].respond(200);

        callback.verify();
    });

    it('callService should send response to callback', function() {
        var callback = sandbox.mock().withArgs(200, '..res..').atLeast(1);

        callService({method: 'GET', url: '/tasks'}, callback);
        xhr.requests[0].respond(200, {}, '..res..');

        callback.verify();
    });

    it('callService should send error response to callback', function() {
        var callback = sandbox.mock().withArgs(404, '..err..').atLeast(1);

        callService({method: 'GET', url: '/tasks'}, callback);
        xhr.requests[0].respond(404, {}, '..err..');

        callback.verify();
    });    

    it('callService should only send when final response received', function() {
        var callback = sandbox.spy();
        callService({method: 'GET', url: '/tasks'}, callback);

        expect(callback.callCount).to.be.eql(0);
    });

    it('should register initpage handler with window onload', function() {
        expect(window.onload).to.be.eql(initpage);
    });

    it('initpage should call getTasks', function(done) {
        sandbox.stub(window, 'getTasks', done);

        initpage();
    });

});
