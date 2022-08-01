<?php
    $id = $_POST['id'];
    
    //if (isset($_COOKIE['id']) || isset($_SESSION['id'])) {
    if (true) {

        $userID;
        $response;

        if (isset($_COOKIE['id'])) {
            $userID = $_COOKIE['id'];
        }else{
            //$userID = $_SESSION['id'];
            $userID = 1;
        }

        require "bd-start.php";

        $mysqli->query("DELETE FROM `notes` WHERE notes.id = $id AND (notes.customer = $userID OR notes.performer = $userID)");
        
        $response['success'] = 'Заметка удалена!';

        require "bd-end.php";

    }else{
        $response['error'] = 'Вы не авторизованны, 
        авторизуйтесь для добавления заметок!';
    }
    
    header('Content-Type: application/json');
    $response = json_encode ($data, JSON_UNESCAPED_UNICODE);
    echo $response;
    ?>