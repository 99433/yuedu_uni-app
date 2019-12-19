<?php
namespace hsC;
class index{
	
	public function index(){
		exit(jsonCode('ok', 'api 1.0.1...'));
	}
	
	public function test() {
		echo '<h1>test</h1>';
	}
}
