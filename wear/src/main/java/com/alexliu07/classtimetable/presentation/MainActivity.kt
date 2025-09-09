/* While this template provides a good starting point for using Wear Compose, you can always
 * take a look at https://github.com/android/wear-os-samples/tree/main/ComposeStarter to find the
 * most up to date changes to the libraries and their usages.
 */

package com.alexliu07.classtimetable.presentation

import android.R.style
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.room.ColumnInfo
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material3.Card
import androidx.wear.compose.material3.ListHeader
import androidx.wear.compose.material3.Text
import androidx.wear.tooling.preview.devices.WearDevices
import com.alexliu07.classtimetable.R.string
import com.alexliu07.classtimetable.presentation.theme.ClassTimetableTheme
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMap
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable
import java.time.LocalTime

class MainActivity : ComponentActivity() , DataClient.OnDataChangedListener {

    override fun onResume() {
        super.onResume()
        Log.i("listener","data listener added")
        Wearable.getDataClient(this).addListener(this)
    }

    override fun onPause() {
        super.onPause()
        Log.i("listener","data listener removed")
        Wearable.getDataClient(this).removeListener(this)
    }

    override fun onDataChanged(dataEvents: DataEventBuffer) {
        Log.i("listener","event get")
        for (event in dataEvents) {
            if (event.type == DataEvent.TYPE_CHANGED) {
                val dataItem = event.dataItem
                if (dataItem.uri.path == "/data") {
                    val db = Room.databaseBuilder(applicationContext, AppDatabase::class.java,"data").allowMainThreadQueries().build()
                    val dataDao = db.dataDao()
                    // 处理接收到的数据
                    val dataMap = DataMapItem.fromDataItem(dataItem).dataMap
                    importData(dataDao,dataMap)
                    Log.i("data","changed")
                }
            } else if (event.type == DataEvent.TYPE_DELETED) {
                // 处理数据项被删除
                Log.i("data","deleted")
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        setTheme(style.Theme_DeviceDefault)
        val db = Room.databaseBuilder(applicationContext, AppDatabase::class.java,"data").allowMainThreadQueries().build()
        val dataDao = db.dataDao()
        setContent {
            WearApp(dataDao)
        }

    }
}

data class ListItem(val id: Int, val time: String, val subject: String)

@Entity
data class Data(
    @PrimaryKey(autoGenerate = true) val id: Int? = null,
    @ColumnInfo val day: Int,
    @ColumnInfo val subject: String,
    @ColumnInfo val startTime: LocalTime,
    @ColumnInfo val endTime: LocalTime
)

class Converters{
    @TypeConverter
    fun fromLocalTime(time: LocalTime): String{
        return time.toString()
    }

    @TypeConverter
    fun toLocalTime(time: String): LocalTime{
        return LocalTime.parse(time)
    }
}

@Dao
interface DataDao{
    @Insert
    fun insert(data: Data)

    @Query("SELECT * FROM data WHERE day = :day")
    fun getData(day: Int): List<Data>

    @Query("SELECT * FROM data")
    fun getAll(): List<Data>

    @Query("DELETE FROM data")
    fun empty()

    @Query("DELETE FROM sqlite_sequence")
    fun resetPrimaryKey()

    @Query("SELECT (SELECT COUNT(*) FROM data) == 0")
    fun isEmpty(): Boolean
}

@Database(entities = [Data::class], version = 1)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase(){
    abstract fun dataDao(): DataDao
}

fun emptyDB(db: DataDao){
    db.empty()
    db.resetPrimaryKey()
}

@Composable
fun WearApp(db: DataDao) {
    Log.i("page","wearapp run")
    val pageData = loadData(db)
    ClassTimetableTheme {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colors.background),
            contentAlignment = Alignment.Center
        ) {
            ClassDisplay(db,pageData)
        }
    }
}

fun importData(db: DataDao,data: DataMap){
    emptyDB(db)
    val dataList = data.getDataMapArrayList("data")
    if (dataList != null) {
        for(item in dataList){
            val day = item.getInt("day")
            val subject = item.getString("subject")
            val startTime = LocalTime.parse(item.getString("startTime"))
            val endTime = LocalTime.parse(item.getString("endTime"))
            val tempData = Data(day=day, subject = subject!!, startTime = startTime, endTime = endTime)
            db.insert(tempData)
        }
    }
}

@Composable
fun loadData(db: DataDao):SnapshotStateList<SnapshotStateList<ListItem>>{
    val pageData = remember { mutableStateListOf<SnapshotStateList<ListItem>>() }
    if(db.isEmpty()){
        for(i in 0..6){
            val tempList = remember { mutableStateListOf<ListItem>() }
            tempList.add(ListItem(0,stringResource(string.no_timetable),stringResource(string.please_import)))
            pageData.add(tempList)
        }
    }else{
        for(i in 0..6){
            val tempData = db.getData(i).sortedBy { it.startTime }
            val tempList = remember { mutableStateListOf<ListItem>() }
            for(data in tempData)tempList.add(ListItem(data.id!!,"${data.startTime} - ${data.endTime}",data.subject))
            pageData.add(tempList)
        }
    }
    return pageData
}

@Composable
fun ClassDisplay(db: DataDao,pageData:SnapshotStateList<SnapshotStateList<ListItem>>){
    val pageCount = 7
    val pagerState = rememberPagerState { pageCount }

    Column( // Use a Column to stack Pager and Indicators
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        HorizontalPager(
            state = pagerState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) { page ->
            PageContent(pageNumber = page, pageContent = pageData[page])
        }
        // Page Indicators
        Row(
            Modifier
                .height(20.dp)
                .fillMaxWidth()
                .padding(bottom = 4.dp), // Add some padding at the bottom
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            repeat(pageCount) { iteration ->
                val color =
                    if (pagerState.currentPage == iteration) MaterialTheme.colors.primary else Color.LightGray
                Box(
                    modifier = Modifier
                        .padding(horizontal = 2.dp)
                        .clip(CircleShape)
                        .background(color)
                        .size(6.dp) // Size of the dot
                )
            }
        }
    }
}

@Composable
fun PageContent(pageNumber:Int,pageContent: SnapshotStateList<ListItem>){
    Log.i("page","$pageNumber $pageContent")
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(4.dp),
        contentAlignment = Alignment.Center
    ){
        val listState = rememberScalingLazyListState()
        ScalingLazyColumn(
            modifier = Modifier.fillMaxSize(),
            state = listState,
            contentPadding = PaddingValues(
                top = 8.dp,
                bottom = 8.dp,
                start = 8.dp,
                end = 8.dp
            ),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            item{
                ListHeader (
                    modifier = Modifier.fillMaxWidth(),
                ){
                    val dayText = when(pageNumber){
                        0 -> stringResource(id = string.day0)
                        1 -> stringResource(id = string.day1)
                        2 -> stringResource(id = string.day2)
                        3 -> stringResource(id = string.day3)
                        4 -> stringResource(id = string.day4)
                        5 -> stringResource(id = string.day5)
                        6 -> stringResource(id = string.day6)
                        else -> ""
                    }
                    Text(text=dayText)
                }
            }
            items(pageContent){item->
                Card(
                    onClick = { /* Do something */ },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp)
                ) {
                    Text(
                        text = item.time,
                        fontSize = 10.sp
                    )
                    Text(
                        text = item.subject,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}