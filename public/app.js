(function(){
	var app = angular.module('binfo', ['ngFileUpload']);

	app.controller('mainController', ['$scope', '$http', function ($scope, $http) {
		$scope.uploadedFiles = [];

		$scope.updateFileList = function() {
			$http.get('/uploaded').success(function(data) {
				$scope.uploadedFiles = data;
			});
		};

		$scope.runr = function(){
			$http.get('/run_r').success(function(data) {
				alert(data);
			});
		};

		$scope.deleteFile = function(f) {
			$http.post('/deleteFile',  {file: f}).success(function(data) {
				if(data && data.toLowerCase() === '1'){
					$scope.updateFileList();
				}
				else{
					alert(data);
				}
			});
		};
		
		$scope.updateFileList();
	}]);

	app.controller('uploadController', ['$scope', 'Upload', function ($scope, Upload) {
		var upl = this;

		$scope.status = {success: null, progress: 0 };
		$scope.setStatus = function(s, p){
			

			$scope.status.success = s;
			$scope.status.progress = p;
		}

		$scope.upload = function(file) {
			Upload.upload({
				url: '/upload',
				data: {
					file: file
				}
			}).progress(function(evt) {
				$scope.setStatus(null, parseFloat(100.0 * evt.loaded / evt.total));
			}).success(function(data, status, headers, config) {
				setTimeout(function(){
					$scope.setStatus(null, 0);
					$scope.updateFileList();

				}, 500);
				
			});

			/*then(function(resp) {
				console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
				$scope.setStatus(true, null);
			}, function(resp) {
				$scope.setStatus(false, null);
			}, function(evt) {
				console.log(parseInt(100.0 * evt.loaded / evt.total));
				$scope.setStatus(null, parseInt(100.0 * evt.loaded / evt.total));
			});*/
		};
	}]);

})();