<?php
$base_dir = dirname(__FILE__) . '/../../';

require($base_dir . 'CSSMin.php');

define('LINE', "\n");
	
function iu_minify_js($fileList, $compress_path, $compress=true) {
	if( is_array($fileList) && !empty($fileList) ) {
		
		$output_file = $compress_path . basename('iu', ".js") . ".comment.js";
		$output_file_min = $compress_path . basename('iu', ".js") . ".js";
		
		echo $output_file_min . ' : start compress' . LINE;

		$content = '';
		foreach($fileList as $value) {
			if (file_exists($value)) {
				$content .= file_get_contents($value);
			}
		}

		file_put_contents($output_file, $content);

		// $fp = fopen($output_file, 'w');
		// fwrite($fp, $content);
		// fclose($fp);

		$data = '';
		$batQuery = "java -jar $base_dir compiler.jar --js $output_file --js_output_file $output_file_min";
		
		$cmdPost = exec($batQuery, $out, $status);

		if($status === 0) {
			$data = file_get_contents($output_file_min);
			echo $output_file_min . ' : compress success' . LINE;
			return;
			return $data;
		}

		return false;
	}
}

function iu_minify_css($fileList, $compress_path, $compress = true)	{
	if( $compress && is_array($fileList) && !empty($fileList)) {

		$output_file = $compress_path . "iu.comment.css";
		$output_file_min = $compress_path . "iu.css";
		
		echo $output_file_min . ' : start compress' . LINE;
		
		$content = '';
		foreach($fileList as $value) {
			if (file_exists($value)) {
				$content .= file_get_contents($value). LINE;
			}
		}

		file_put_contents($output_file, $content);
		
		$content = CSSMin::minify($content);

		$content = '@charset "utf-8";' . str_replace('@charset "utf-8";', '', $content);

		$content = preg_replace("/(\.\.\/)+img\//i", '../../img/', $content);

		file_put_contents($output_file_min, $content);

		echo $output_file_min . ' : compress success' . LINE . LINE;
	}
}

function iu_pack($path, $zip_name)	{
	$zip = new PclZip($zip_name);
	$zip->create($path);
}

// 命令行调用
if (isset($argv[0]) && preg_match('/iu.compress/', $argv[0])) {
	$path_base = dirname(__FILE__) . '/';

	$path_js = $path_base . 'js/';
	$path_css = $path_base . 'theme/default/css/';

	$compress_path_js = $path_js;
	$compress_path_css = $path_css;

	$js_list = array(
		$path_js . 'iu.base.js',
		$path_js . 'iu.autocomplete.js',
		$path_js . 'iu.datapicker.js',
		$path_js . 'iu.dialog.js',
		$path_js . 'iu.drag.js',
		$path_js . 'iu.menu.js',
		$path_js . 'iu.mscroll.js',
		$path_js . 'iu.notice.js',
		$path_js . 'iu.placeholder.js',
		$path_js . 'iu.player.js',
		$path_js . 'iu.mselect.js',
		$path_js . 'iu.slider.js',
		$path_js . 'iu.snav.js',
		$path_js . 'iu.spinner.js',
		$path_js . 'iu.tabs.js',
		$path_js . 'iu.tip.js',
		// $path_js . 'iu.promptareacode.js',
		// $path_js . 'iu.promptemail.js',
	);
	
	$css_list = array(
		$path_css . 'iu.base.css',
		$path_css . 'iu.autocomplete.css',
		$path_css . 'iu.datapicker.css',
		$path_css . 'iu.dialog.css',
		$path_css . 'iu.menu.css',
		$path_css . 'iu.mselect.css',
		$path_css . 'iu.notice.css',
		$path_css . 'iu.player.css',
		$path_css . 'iu.promptareacode.css',
		$path_css . 'iu.snav.css',
		$path_css . 'iu.spinner.css',
		$path_css . 'iu.tabs.css',
		$path_css . 'iu.tip.css',
	);

	iu_minify_js($js_list, $compress_path_js);
	iu_minify_css($css_list, $compress_path_css);
	// iu_pack($path, $zip_name);
}
?>