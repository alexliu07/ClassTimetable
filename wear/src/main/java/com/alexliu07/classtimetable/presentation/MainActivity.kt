/* While this template provides a good starting point for using Wear Compose, you can always
 * take a look at https://github.com/android/wear-os-samples/tree/main/ComposeStarter to find the
 * most up to date changes to the libraries and their usages.
 */

package com.alexliu07.classtimetable.presentation

import android.R.style
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.room.Room
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.ScalingLazyColumnDefaults
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.foundation.pager.HorizontalPager
import androidx.wear.compose.foundation.pager.rememberPagerState
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material3.AppScaffold
import androidx.wear.compose.material3.Card
import androidx.wear.compose.material3.CardDefaults
import androidx.wear.compose.material3.HorizontalPageIndicator
import androidx.wear.compose.material3.HorizontalPagerScaffold
import androidx.wear.compose.material3.ListHeader
import androidx.wear.compose.material3.PagerScaffoldDefaults
import androidx.wear.compose.material3.ScreenScaffold
import androidx.wear.compose.material3.ScrollIndicator
import androidx.wear.compose.material3.Text
import com.alexliu07.classtimetable.AppDatabase
import com.alexliu07.classtimetable.Data
import com.alexliu07.classtimetable.DataDao
import com.alexliu07.classtimetable.R.string
import com.alexliu07.classtimetable.emptyDB
import com.alexliu07.classtimetable.presentation.theme.ClassTimetableTheme
import com.google.android.gms.wearable.DataMap
import com.google.android.gms.wearable.DataMapItem
import me.chenhe.lib.wearmsger.DataHub
import me.chenhe.lib.wearmsger.listener.DataListener
import java.time.LocalTime
import java.util.Calendar


class MainActivity : ComponentActivity(){

    lateinit var db: AppDatabase
    lateinit var dataDao: DataDao

    override fun onResume() {
        super.onResume()
        DataHub.addDataListener(this,dataListener)
        Log.i("listener","data listener added")

    }

    override fun onPause() {
        super.onPause()
        DataHub.removeDataListener(this,dataListener)
        Log.i("listener","data listener removed")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        setTheme(style.Theme_DeviceDefault)
        db = Room.databaseBuilder(applicationContext, AppDatabase::class.java,"data").allowMainThreadQueries().build()
        dataDao = db.dataDao()
        setContent {
            WearApp()
        }
    }

    override fun finish() {
        Log.i("database","database closed")
        db.close()
        super.finish()
    }

    private val dataListener = object : DataListener {
        override fun onDataChanged(dataMapItem: DataMapItem) {
            dataMapItem.run {
                if (uri.path == "/import") {
                    importData(dataMap)
                    Log.i("data","changed")
                }
            }
        }

        override fun onDataDeleted(uri: Uri) {
            Log.i("data","deleted")
        }
    }

    @Composable
    fun WearApp() {
        Log.i("page","wearapp run")
        val pageData = loadData()
        ClassTimetableTheme {
            AppScaffold(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colors.background),
            ) {
                ClassDisplay(pageData)
            }
        }
    }

    @Composable
    fun ClassDisplay(pageData:SnapshotStateList<SnapshotStateList<ListItem>>){
        val pageCount = 7
        val pagerState = rememberPagerState((Calendar.getInstance().get(Calendar.DAY_OF_WEEK)+5)%7){pageCount}
        HorizontalPagerScaffold(
            pagerState = pagerState,
            pageIndicator = { HorizontalPageIndicator(pagerState, backgroundColor = Color(0x00,0x00,0x00,0x00)) }
        ) {
            HorizontalPager(
                state = pagerState,
                flingBehavior = PagerScaffoldDefaults.snapWithSpringFlingBehavior(state = pagerState),
                rotaryScrollableBehavior = null
            ) { page ->
                PageContent(pageNumber = page, pageContent = pageData[page])
            }
        }
    }

    @Composable
    fun PageContent(pageNumber:Int,pageContent: SnapshotStateList<ListItem>){
        val listState = rememberScalingLazyListState()
        ScreenScaffold (
            scrollState = listState,
            scrollIndicator = { ScrollIndicator(state = listState) }
        ) {
            ScalingLazyColumn(
                state = listState,
                verticalArrangement = Arrangement.spacedBy(6.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                flingBehavior = ScalingLazyColumnDefaults.snapFlingBehavior(state = listState)
            ) {
                item {
                    ListHeader(modifier = Modifier.fillMaxWidth()) {
                        val dayText = when (pageNumber) {
                            0 -> stringResource(id = string.day0)
                            1 -> stringResource(id = string.day1)
                            2 -> stringResource(id = string.day2)
                            3 -> stringResource(id = string.day3)
                            4 -> stringResource(id = string.day4)
                            5 -> stringResource(id = string.day5)
                            6 -> stringResource(id = string.day6)
                            else -> ""
                        }
                        Text(text = dayText)
                    }
                }
                items(pageContent) { item ->
                    Card(
                        onClick = { /* Do something */ },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 8.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colors.surface,
                            titleColor = MaterialTheme.colors.primary
                        )
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

    data class ListItem(val id: Int, val time: String, val subject: String)

    fun importData(data: DataMap){
        emptyDB(dataDao)
        val dataList = data.getDataMapArrayList("data")
        if (dataList != null) {
            for(item in dataList){
                val day = item.getInt("day")
                val subject = item.getString("subject")
                val startTime = LocalTime.parse(item.getString("startTime"))
                val endTime = LocalTime.parse(item.getString("endTime"))
                val tempData = Data(day = day, subject = subject!!, startTime = startTime, endTime = endTime)
                dataDao.insert(tempData)
            }
        }
        Toast.makeText(this,this.getString(string.transfer_success),Toast.LENGTH_SHORT).show()
    }

    @Composable
    fun loadData():SnapshotStateList<SnapshotStateList<ListItem>>{
        val pageData = remember { mutableStateListOf<SnapshotStateList<ListItem>>() }
        if(dataDao.isEmpty()){
            for(i in 0..6){
                val tempList = remember { mutableStateListOf<ListItem>() }
                tempList.add(ListItem(0,stringResource(string.no_timetable),stringResource(string.please_import)))
                pageData.add(tempList)
            }
        }else{
            for(i in 0..6){
                val tempData = dataDao.getData(i).sortedBy { it.startTime }
                val tempList = remember { mutableStateListOf<ListItem>() }
                if(tempData.isEmpty())tempList.add(ListItem(0,stringResource(string.have_a_rest),stringResource(string.no_schedule)))
                for(data in tempData)tempList.add(ListItem(data.id!!,"${data.startTime} - ${data.endTime}",data.subject))
                pageData.add(tempList)
            }
        }
        return pageData
    }
}

